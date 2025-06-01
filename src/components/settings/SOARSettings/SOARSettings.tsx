import { Box, Dialog, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { green, red } from "@mui/material/colors";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import PuffLoader from "react-spinners/PuffLoader";
import { DataGrid, GridColDef, GridRowParams, GridRowSelectionModel } from "@mui/x-data-grid";
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import { useEffect, useState } from "react";
import { EditSOARInfoDialog } from "./EditSOARInfoDialog";
import { SOAR_CHOICES } from "../../../constants/platform-choices";
import { NewSOARInfoDialog } from "./NewSOARInfoDialog";
import { ConfirmationDialog } from "../../utils/ConfirmationDialog";
import { useCookies } from "react-cookie";
import { ActionObject, CallbackFunction, SOARData } from "../../../types/types";

interface TargetSOAR {
    id: number;
    [key: string]: any;
}

export const SOARSettings = () => {
    const [cookies, _setCookies, removeCookies] = useCookies(["token"]);
    const [soarsData, setSoarsData] = useState<SOARData[]>([]);
    const [selectedSoarData, setSelectedSoarData] = useState<SOARData>();
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
    const [soarsLoading, setSoarsLoading] = useState<boolean>(true);

    const [newDialogOpen, setNewDialogOpen] = useState<boolean>(false);
    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [upcomingAction, setUpcomingAction] = useState<ActionObject>({});

    // Stores the function and arguments to execute after confirmation dialog
    const scheduleUpcomingAction = (func: CallbackFunction, ...args: any[]) => {
        setUpcomingAction({ func, args });
    };

    const executeUpcomingAction = async () => {
        if (upcomingAction.func) {
            await upcomingAction.func(...(upcomingAction.args || []));
        }
    };

    const handleEditDialogOpen = (params: any) => {
        setSelectedSoarData(params.row as SOARData);
        setEditDialogOpen(true);
    };

    const handleEditDialogClose = () => {
        setSelectedSoarData(undefined);
        setEditDialogOpen(false);
    };

    // fetch the soar data from the backend
    const updateSoarsData = async () => {
        setSoarsLoading(true);
        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + "soar/soar_info/",
            {
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                }
            }
        );
        const rawData = await response.json();
        if (rawData.code && rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        const output: SOARData[] = [];
        const raw = localStorage.getItem("targetSOAR");
        const targetSOAR: TargetSOAR | null = raw ? (JSON.parse(raw) as TargetSOAR) : null;

        for (let soar of rawData["message"]) {
            const formattedData: SOARData = {
                id: soar.id,
                name: soar.name,
                type: soar.soar_type in SOAR_CHOICES ? SOAR_CHOICES[soar.soar_type] : "Unknown",
                url: `${soar.protocol}//${soar.hostname}${soar.base_dir}`,
                apiKey: soar.api_key,
                isTarget: !!(targetSOAR && soar.id === targetSOAR.id)
            };
            output.push(formattedData);
        }

        setSoarsData(output);
        setSoarsLoading(false);
    };

    // the handler of set target button
    const handleSoarSetTarget = (params: GridRowParams) => {
        const updatedData = [...soarsData];
        for (let index = 0; index < updatedData.length; index++) {
            if (updatedData[index].id === params.row.id) {
                updatedData[index].isTarget = true;
                localStorage.setItem("targetSOAR", JSON.stringify(updatedData[index]));
            } else {
                updatedData[index].isTarget = false;
            }
        }
        setSoarsData(updatedData);
    };

    // the handler of individual delete buttons
    const handleSoarDelete = async (params: GridRowParams) => {
        const updatedData = [...soarsData];
        let isTarget = false;
        for (let index = 0; index < updatedData.length; index++) {
            if (updatedData[index].id === params.row.id) {
                isTarget = updatedData[index].isTarget;
                const formData = new FormData();
                formData.append("soar_id", params.row.id.toString());

                const response = await fetch(
                    process.env.REACT_APP_BACKEND_URL + "soar/soar_info/",
                    {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${cookies.token}`
                        },
                        body: formData
                    }
                );
                const responseJson = await response.json();

                if (responseJson.code && responseJson.code === "token_not_valid") {
                    removeCookies("token");
                    return;
                }

                updatedData.splice(index, 1);
                break;
            }
        }
        if (isTarget) {
            localStorage.removeItem("targetSOAR");
        }
        setSoarsData(updatedData);
    };

    // the handler of the mass delete button
    const handleSoarMassDelete = async () => {
        const updatedData = [...soarsData];
        const currentSelectionModel = [...selectionModel];
        let deletedTarget = false;
        for (let index = 0; index < updatedData.length; index++) {
            let deleted = false;
            for (let selectionModelIndex = 0; selectionModelIndex < currentSelectionModel.length; selectionModelIndex++) {
                if (updatedData[index].id === currentSelectionModel[selectionModelIndex]) {
                    if (updatedData[index].isTarget) {
                        deletedTarget = true;
                    }

                    const formData = new FormData();
                    formData.append("soar_id", currentSelectionModel[selectionModelIndex].toString());

                    const response = await fetch(
                        process.env.REACT_APP_BACKEND_URL + "soar/soar_info/",
                        {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${cookies.token}`
                            },
                            body: formData
                        }
                    );
                    const responseJson = await response.json();

                    if (responseJson.code && responseJson.code === "token_not_valid") {
                        removeCookies("token");
                        return;
                    }

                    updatedData.splice(index, 1);
                    currentSelectionModel.splice(selectionModelIndex, 1);
                    deleted = true;
                    break;
                }
            }
            if (deleted) {
                index--;
            }
        }
        if (deletedTarget) {
            localStorage.removeItem("targetSOAR");
        }
        setSoarsData(updatedData);
    };

    const handleSoarCreate = async (soarInfo: SOARData) => {
        const requestBody = new FormData();
        const urlObj = new URL(soarInfo.url);
        requestBody.append("name", soarInfo.name);
        requestBody.append("soar_type", soarInfo.type);
        requestBody.append("protocol", urlObj.protocol);
        requestBody.append("hostname", urlObj.host);
        requestBody.append("base_dir", urlObj.pathname);
        requestBody.append("api_key", soarInfo.apiKey);

        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "soar/soar_info/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${cookies.token}`
            },
            body: requestBody
        });
        const responseJson = await response.json();

        if (responseJson.code && responseJson.code === "token_not_valid") {
            removeCookies("token");
            return;
        }
        updateSoarsData();
    };

    const handleSoarEdit = async (updatedInfo: SOARData) => {
        if (!updatedInfo.id) return;
        
        const requestBody = new FormData();
        const urlObj = new URL(updatedInfo.url);
        requestBody.append("soar_id", updatedInfo.id.toString());
        requestBody.append("name", updatedInfo.name);
        requestBody.append("soar_type", updatedInfo.type);
        requestBody.append("protocol", urlObj.protocol);
        requestBody.append("hostname", urlObj.host);
        requestBody.append("base_dir", urlObj.pathname);
        requestBody.append("api_key", updatedInfo.apiKey);

        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "soar/soar_info/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${cookies.token}`
            },
            body: requestBody
        });
        const responseJson = await response.json();

        if (responseJson.code && responseJson.code === "token_not_valid") {
            removeCookies("token");
            return;
        }
        updateSoarsData();
    };

    const paginationModel = { page: 0, pageSize: 5 };
    const columns: GridColDef[] = [
        { field: "id", type: "number", headerName: "ID", flex: 0.1 },
        { field: "name", type: "string", headerName: "Name", flex: 0.6 },
        { field: "type", type: "string", headerName: "Type", flex: 0.3 },
        { field: "url", type: "string", headerName: "URL", flex: 0.6 },
        { field: "apiKey", type: "string", headerName: "API Key", flex: 0.6 },
        {
            field: "isTarget", type: "boolean", headerName: "Is Target", flex: 0.2,
            renderCell: (params) => (
                params.value ? (
                    <CheckIcon style={{ color: green[500] }} />
                ) : (
                    <CloseIcon style={{ color: red[500] }} />
                )
            ),
        },
        {
            field: "actions",
            type: "actions",
            flex: 0.4,
            renderCell: (params: any) => (
                <>
                    <Tooltip title="Set Target">
                        <IconButton onClick={() => { handleSoarSetTarget(params) }}>
                            <LocationSearchingIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton onClick={() => { handleEditDialogOpen(params) }}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => {
                            scheduleUpcomingAction(handleSoarDelete, params);
                            setConfirmDialogOpen(true);
                        }}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </>
            ),
        },
    ];

    useEffect(() => {
        updateSoarsData();
    }, []);

    useEffect(() => {
        // automatically set target if only one entry exists
        if (soarsData.length === 1 && !soarsData[0].isTarget) {
            const updatedData = [...soarsData];
            updatedData[0].isTarget = true;
            localStorage.setItem("targetSOAR", JSON.stringify(updatedData[0]));
            setSoarsData(updatedData);
        } else if (soarsData.length >= 1) {
            // modify SOAR data stored in local storage if the react states are changed
            let targetSOAR: TargetSOAR | null = JSON.parse(localStorage.getItem("targetSOAR") || "null");
            if (!targetSOAR) {
                return;
            }
            for (let index = 0; index < soarsData.length; index++) {
                if (soarsData[index].id === targetSOAR.id) {
                    targetSOAR = { ...soarsData[index] };
                    localStorage.setItem("targetSOAR", JSON.stringify(targetSOAR));
                    break;
                }
            }
        }
    }, [soarsData]);

    return (
        <>
            <Dialog open={newDialogOpen} onClose={() => { setNewDialogOpen(false) }} fullWidth>
                <NewSOARInfoDialog onClose={() => { setNewDialogOpen(false) }} onCreate={handleSoarCreate} />
            </Dialog>

            <Dialog open={confirmDialogOpen} onClose={() => { setConfirmDialogOpen(false) }} fullWidth>
                <ConfirmationDialog onCancel={() => { setConfirmDialogOpen(false) }} onContinue={() => { executeUpcomingAction(); setConfirmDialogOpen(false) }} />
            </Dialog>

            <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth>
                <EditSOARInfoDialog selectedSoarData={selectedSoarData} onClose={handleEditDialogClose} onSave={handleSoarEdit} />
            </Dialog>

            {
                soarsLoading ? (
                    <>
                        <Typography variant="h6" width="50vw" sx={{ display: "inline-block" }}>SOAR Information</Typography>
                        <PuffLoader color="#00ffea" />
                    </>
                ) : (
                    <>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="h6" width="50vw" sx={{ display: "inline-block" }}>SOAR Information</Typography>
                            <Box>
                                {
                                    selectionModel.length > 0 && (
                                        <Tooltip title="Delete Selection">
                                            <IconButton onClick={() => {
                                                scheduleUpcomingAction(handleSoarMassDelete);
                                                setConfirmDialogOpen(true);
                                            }}>
                                                <DeleteIcon style={{ color: red[500] }} />
                                            </IconButton>
                                        </Tooltip>
                                    )
                                }

                                <Tooltip title="Add New">
                                    <IconButton onClick={() => { setNewDialogOpen(true) }}>
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Refresh">
                                    <IconButton onClick={updateSoarsData}>
                                        <RefreshIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                        <Paper sx={{ height: 400, width: "calc(100vw - 125px)" }}>
                            <DataGrid
                                rows={soarsData}
                                columns={columns}
                                initialState={{ pagination: { paginationModel } }}
                                pageSizeOptions={[5, 10]}
                                checkboxSelection
                                rowSelectionModel={selectionModel}
                                onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
                                disableRowSelectionOnClick
                                sx={{
                                    border: 0,
                                    "& .MuiDataGrid-checkboxInput": {
                                        color: "primary.main",
                                        "&.Mui-checked": {
                                            color: "secondary.main",
                                        },
                                    }
                                }}
                            />
                        </Paper>
                    </>
                )
            }
        </>
    );
};