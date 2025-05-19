import { Box, Dialog, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { green, red } from "@mui/material/colors";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import PuffLoader from "react-spinners/PuffLoader"
import { DataGrid } from "@mui/x-data-grid";
import { BiTargetLock } from "react-icons/bi";
import { useEffect, useState } from "react";
import { EditSIEMInfoDialog } from "./EditSIEMInfoDialog";
import { SIEM_CHOICES } from "../../../constants/platform-choices";
import { NewSIEMInfoDialog } from "./NewSIEMInfoDialog";
import { ConfirmationDialog } from "../../utils/ConfirmationDialog";
import { useCookies } from "react-cookie";

export const SIEMSettings = () => {
    const [cookies, setCookies, removeCookies] = useCookies(["token"]);
    const [siemsData, setSiemsData] = useState([]);
    const [selectedSiemData, setSelectedSiemData] = useState(null);
    const [selectionModel, setSelectionModel] = useState([]);
    const [siemsLoading, setSiemsLoading] = useState(true);

    const [newDialogOpen, setNewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [upcomingAction, setUpcomingAction] = useState({});

    const scheduleUpcomingAction = (func, ...args) => {
        setUpcomingAction({ func, args });
    };
    const executeUpcomingAction = async () => {
        if (upcomingAction) {
            const { func, args } = upcomingAction;
            await func(...args);
        }
    };

    const handleEditDialogOpen = (params) => {
        setSelectedSiemData(params.row)
        setEditDialogOpen(true);
    }

    const handleEditDialogClose = () => {
        setSelectedSiemData(null)
        setEditDialogOpen(false);
    }

    // fetch the siem data from the backend
    const updateSiemsData = async () => {
        setSiemsLoading(true);
        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + "siem/siem_info/",
            {
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                },
            }
        );
        const rawData = await response.json();

        if (rawData.code && rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        const output = [];
        const targetSIEM = JSON.parse(localStorage.getItem("targetSIEM"));

        for (let siem of rawData["message"]) {
            const formattedData = {
                id: siem.id,
                name: siem.name,
                type: SIEM_CHOICES[siem.siem_type] ? SIEM_CHOICES[siem.siem_type] : "Unknown",
                url: `${siem.protocol}//${siem.hostname}${siem.base_dir}`,
                usAPIKey: siem.use_api_key,
                authType: siem.use_api_key ? "API Key" : "Username / Password",
                apiKey: siem.api_key,
                username: siem.username,
                password: siem.password,
                isTarget: targetSIEM && siem.id === targetSIEM.id
            };
            output.push(formattedData);
        }

        setSiemsData(output);
        setSiemsLoading(false);
    }

    // the handler of set target button
    const handleSiemSetTarget = (params) => {
        const updatedData = Object.assign([], siemsData);
        for (let index = 0; index < updatedData.length; index++) {
            if (updatedData[index].id === params.row.id) {
                updatedData[index].isTarget = true;
                localStorage.setItem("targetSIEM", JSON.stringify(updatedData[index]));
            } else {
                updatedData[index].isTarget = false;
            }
        }
        setSiemsData(updatedData);
    }

    // the handler of individual delete buttons
    const handleSiemDelete = async (params) => {
        const updatedData = Object.assign([], siemsData);
        let isTarget = false;
        for (let index = 0; index < updatedData.length; index++) {
            if (updatedData[index].id === params.row.id) {
                isTarget = updatedData[index].isTarget
                const formData = new FormData();
                formData.append("siem_id", params.row.id);

                const response = await fetch(
                    process.env.REACT_APP_BACKEND_URL + "siem/siem_info/",
                    {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${cookies.token}`
                        },
                        body: formData
                    }
                );
                const responseJson = response.json();

                if (responseJson.code && responseJson.code === "token_not_valid") {
                    removeCookies("token");
                    return;
                }

                updatedData.splice(index, 1);
                break;
            }
        }
        if (isTarget) {
            localStorage.removeItem("targetSIEM");
        }
        setSiemsData(updatedData);
    }

    // the handler of the mass delete button
    const handleSiemMassDelete = async () => {
        const updatedData = Object.assign([], siemsData);
        const currentSelectionModel = Object.assign([], selectionModel);
        let deletedTarget = false;
        for (let index = 0; index < updatedData.length; index++) {
            let deleted = false;
            for (let selectionModelIndex = 0; selectionModelIndex < currentSelectionModel.length; selectionModelIndex++) {
                if (updatedData[index].id === currentSelectionModel[selectionModelIndex]) {
                    if (updatedData[index].isTarget) {
                        deletedTarget = true;
                    }

                    const formData = new FormData();
                    formData.append("siem_id", currentSelectionModel[selectionModelIndex]);

                    const response = await fetch(
                        process.env.REACT_APP_BACKEND_URL + "siem/siem_info/",
                        {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${cookies.token}`
                            },
                            body: formData
                        }
                    );
                    const responseJson = response.json();

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
            localStorage.removeItem("targetSIEM");
        }
        setSiemsData(updatedData);
    }

    const handleSiemCreate = async (siemInfo) => {
        const requestBody = new FormData();
        const urlObj = new URL(siemInfo.url);
        requestBody.append("name", siemInfo.name);
        requestBody.append("siem_type", Object.keys(SIEM_CHOICES).find(key => SIEM_CHOICES[key] === siemInfo.type));
        requestBody.append("protocol", urlObj.protocol);
        requestBody.append("hostname", urlObj.host);
        requestBody.append("base_dir", urlObj.pathname);
        requestBody.append("use_api_key", siemInfo.useAPIKey);
        requestBody.append("api_key", siemInfo.apiKey);
        requestBody.append("username", siemInfo.username);
        requestBody.append("password", siemInfo.password);

        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "siem/siem_info/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${cookies.token}`
            },
            body: requestBody
        });

        const responseJson = response.json();

        if (responseJson.code && responseJson.code === "token_not_valid") {
            removeCookies("token");
            return;
        }
        
        updateSiemsData();
    }

    const handleSiemEdit = async (updatedInfo) => {
        const requestBody = new FormData();
        const urlObj = new URL(updatedInfo.url);
        requestBody.append("siem_id", updatedInfo.id);
        requestBody.append("name", updatedInfo.name);
        requestBody.append("siem_type", Object.keys(SIEM_CHOICES).find(key => SIEM_CHOICES[key] === updatedInfo.type));
        requestBody.append("protocol", urlObj.protocol);
        requestBody.append("hostname", urlObj.host);
        requestBody.append("base_dir", urlObj.pathname);
        requestBody.append("use_api_key", updatedInfo.useAPIKey);
        requestBody.append("api_key", updatedInfo.apiKey);
        requestBody.append("username", updatedInfo.username);
        requestBody.append("password", updatedInfo.password);

        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "siem/siem_info/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${cookies.token}`
            },
            body: requestBody
        });
        const responseJson = response.json();

        if (responseJson.code && responseJson.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        updateSiemsData();
    }

    const paginationModel = { page: 0, pageSize: 5 };
    const columns = [
        { field: "id", type: "number", headerName: "ID", flex: 0.1 },
        { field: "name", type: "string", headerName: "Name", flex: 0.6 },
        { field: "type", type: "string", headerName: "Type", flex: 0.3 },
        { field: "url", type: "string", headerName: "URL", flex: 0.6 },
        { field: "authType", type: "string", headerName: "Authentication type", flex: 0.6 },
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
            renderCell: (params) => (
                <>
                    <Tooltip title="Set Target">
                        <IconButton onClick={() => { handleSiemSetTarget(params) }}>
                            <BiTargetLock />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton onClick={() => { handleEditDialogOpen(params) }}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => {
                            scheduleUpcomingAction(handleSiemDelete, params);
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
        updateSiemsData();
    }, []);

    useEffect(() => {
        // automatically set target if only one entry exists
        if (siemsData.length === 1 && !siemsData[0].isTarget) {
            const updatedData = Object.assign([], siemsData);
            updatedData[0].isTarget = true;
            localStorage.setItem("targetSIEM", JSON.stringify(updatedData[0]));
            setSiemsData(updatedData);
        } else if (siemsData.length >= 1) {
            // modify SIEM data stored in local storage if the react states are changed
            var targetSIEM = JSON.parse(localStorage.getItem("targetSIEM"));
            if (!targetSIEM) {
                return;
            }
            for (let index = 0; index < siemsData.length; index++) {
                if (siemsData[index].id === targetSIEM.id) {
                    targetSIEM = { ...siemsData[index] }
                    localStorage.setItem("targetSIEM", JSON.stringify(targetSIEM));
                    break;
                }
            }
        }
    }, [siemsData]);

    return (
        <>
            <Dialog open={newDialogOpen} onClose={() => { setNewDialogOpen(false) }} fullWidth>
                <NewSIEMInfoDialog selectedSiemData={selectedSiemData} onClose={() => { setNewDialogOpen(false) }} onCreate={handleSiemCreate} />
            </Dialog>

            <Dialog open={confirmDialogOpen} onClose={() => { setConfirmDialogOpen(false) }} fullWidth>
                <ConfirmationDialog onCancel={() => { setConfirmDialogOpen(false) }} onContinue={() => { executeUpcomingAction(); setConfirmDialogOpen(false) }} />
            </Dialog>

            <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth>
                <EditSIEMInfoDialog selectedSiemData={selectedSiemData} onClose={handleEditDialogClose} onSave={handleSiemEdit} />
            </Dialog>

            {
                siemsLoading ? (
                    <>
                        <Typography variant="h6" width="50vw" sx={{ display: "inline-block" }}>SIEM Information</Typography>
                        <PuffLoader color="#00ffea" />
                    </>
                ) : (
                    <>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="h6" width="50vw" sx={{ display: "inline-block" }}>SIEM Information</Typography>
                            <Box>
                                {
                                    selectionModel.length > 0 && (
                                        <Tooltip title="Delete Selection">
                                            <IconButton onClick={() => {
                                                scheduleUpcomingAction(handleSiemMassDelete)
                                                setConfirmDialogOpen(true)
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
                                    <IconButton onClick={updateSiemsData}>
                                        <RefreshIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                        <Paper sx={{ height: 400, width: "calc(100vw - 125px)" }}>
                            <DataGrid
                                rows={siemsData}
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
    )
}