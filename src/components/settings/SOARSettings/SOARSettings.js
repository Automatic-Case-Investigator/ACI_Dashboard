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
import { EditSOARInfoDialog } from "./EditSOARInfoDialog";
import { SOAR_CHOICES } from "../../../constants/platform-choices";
import { NewSOARInfoDialog } from "./NewSOARInfoDialog";

export const SOARSettings = () => {
    const [soarsData, setSoarsData] = useState([]);
    const [selectedSoarData, setSelectedSoarData] = useState(null);
    const [selectionModel, setSelectionModel] = useState([]);
    const [soarsLoading, setSoarsLoading] = useState(true);

    const [newDialogOpen, setNewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const handleEditDialogOpen = (params) => {
        setSelectedSoarData(params.row)
        setEditDialogOpen(true);
    }

    const handleEditDialogClose = () => {
        setSelectedSoarData(null)
        setEditDialogOpen(false);
    }

    // fetch the soar data from the backend
    const updateSoarsData = async () => {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "soar/get_soars_info/");
        const rawData = (await response.json())["message"];
        const output = [];
        const targetSOAR = JSON.parse(localStorage.getItem("targetSOAR"));

        for (let soar of rawData) {
            const formattedData = {
                id: soar.id,
                name: soar.name,
                type: SOAR_CHOICES[soar.soar_type] ? SOAR_CHOICES[soar.soar_type] : "Unknown",
                url: `${soar.protocol}//${soar.hostname}${soar.base_dir}`,
                apiKey: soar.api_key,
                isTarget: targetSOAR && soar.id === targetSOAR.id
            };
            output.push(formattedData);
        }

        setSoarsData(output);
        setSoarsLoading(false);
    }

    // the handler of set target button
    const handleSoarSetTarget = (params) => {
        const updatedData = Object.assign([], soarsData);
        for (let index = 0; index < updatedData.length; index++) {
            if (updatedData[index].id === params.row.id) {
                updatedData[index].isTarget = true;
                localStorage.setItem("targetSOAR", JSON.stringify(updatedData[index]));
            } else {
                updatedData[index].isTarget = false;
            }
        }
        setSoarsData(updatedData);
    }

    const handleSoarDelete = async (params) => {
        const updatedData = Object.assign([], soarsData);
        let isTarget = false;
        for (let index = 0; index < updatedData.length; index++) {
            if (updatedData[index].id === params.row.id) {
                isTarget = updatedData[index].isTarget
                const formData = new FormData();
                formData.append("soar_id", params.row.id);

                await fetch(
                    process.env.REACT_APP_BACKEND_URL + "soar/delete_soar_info/",
                    { method: "POST", body: formData }
                );

                updatedData.splice(index, 1);
                break;
            }
        }
        if (isTarget) {
            localStorage.removeItem("targetSOAR");
        }
        setSoarsData(updatedData);
    }

    const handleSoarMassDelete = async () => {
        const updatedData = Object.assign([], soarsData);
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
                    formData.append("soar_id", currentSelectionModel[selectionModelIndex]);

                    await fetch(
                        process.env.REACT_APP_BACKEND_URL + "soar/delete_soar_info/",
                        { method: "POST", body: formData }
                    );

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
    }

    const handleSoarCreate = async (soarInfo) => {
        const requestBody = new FormData();
        const urlObj = new URL(soarInfo.url);
        requestBody.append("name", soarInfo.name);
        requestBody.append("soar_type", Object.keys(SOAR_CHOICES).find(key => SOAR_CHOICES[key] === soarInfo.type));
        requestBody.append("protocol", urlObj.protocol);
        requestBody.append("hostname", urlObj.host);
        requestBody.append("base_dir", urlObj.pathname);
        requestBody.append("api_key", soarInfo.apiKey);

        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "soar/add_soar_info/", {
            method: "POST",
            body: requestBody
        });
        console.log(Object.keys(SOAR_CHOICES).find(key => SOAR_CHOICES[key] === soarInfo.type))
        console.log(await response.json())
        updateSoarsData();
    }

    const handleSoarEdit = async (updatedInfo) => {
        const requestBody = new FormData();
        const urlObj = new URL(updatedInfo.url);
        requestBody.append("soar_id", updatedInfo.id);
        requestBody.append("name", updatedInfo.name);
        requestBody.append("soar_type", Object.keys(SOAR_CHOICES).find(key => SOAR_CHOICES[key] === updatedInfo.type));
        requestBody.append("protocol", urlObj.protocol);
        requestBody.append("hostname", urlObj.host);
        requestBody.append("base_dir", urlObj.pathname);
        requestBody.append("api_key", updatedInfo.apiKey);

        await fetch(process.env.REACT_APP_BACKEND_URL + "soar/set_soar_info/", {
            method: "POST",
            body: requestBody
        });
        updateSoarsData();
    }

    const paginationModel = { page: 0, pageSize: 5 };
    const columns = [
        { field: "id", type: "number", headerName: "ID", width: 70 },
        { field: "name", type: "string", headerName: "Name", width: 200 },
        { field: "type", type: "string", headerName: "Type", width: 150 },
        { field: "url", type: "string", headerName: "URL", width: 300 },
        { field: "apiKey", type: "string", headerName: "API Key", width: 400 },
        {
            field: "isTarget", type: "boolean", headerName: "Is Target", width: 150,
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
            width: 150,
            renderCell: (params) => (
                <>
                    <Tooltip title="Set Target">
                        <IconButton onClick={() => { handleSoarSetTarget(params) }}>
                            <BiTargetLock />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton onClick={() => { handleEditDialogOpen(params) }}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => { handleSoarDelete(params) }}>
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
            const updatedData = Object.assign([], soarsData);
            updatedData[0].isTarget = true;
            localStorage.setItem("targetSOAR", JSON.stringify(updatedData[0]));
            setSoarsData(updatedData);
        } else if (soarsData.length >= 1) {
            // modify SOAR data stored in local storage if the react states are changed
            var targetSOAR = JSON.parse(localStorage.getItem("targetSOAR"));
            if (!targetSOAR) {
                return;
            }
            for (let index = 0; index < soarsData.length; index++) {
                if (soarsData[index].id === targetSOAR.id) {
                    targetSOAR = { ...soarsData[index] }
                    localStorage.setItem("targetSOAR", JSON.stringify(targetSOAR));
                    break;
                }
            }
        }
    }, [soarsData]);

    return (
        <>
            <Dialog open={newDialogOpen} onClose={() => { setNewDialogOpen(false) }} fullWidth>
                <NewSOARInfoDialog selectedSoarData={selectedSoarData} onClose={() => { setNewDialogOpen(false) }} onCreate={handleSoarCreate} />
            </Dialog>

            <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth>
                <EditSOARInfoDialog selectedSoarData={selectedSoarData} onClose={handleEditDialogClose} onSave={handleSoarEdit} />
            </Dialog>

            {
                soarsLoading ? (
                    <>
                        <Typography variant="h6" width="50vw" sx={{ display: "inline-block" }}>SOAR</Typography>
                        <PuffLoader color="#00ffea" />
                    </>
                ) : (
                    <>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="h6" width="50vw" sx={{ display: "inline-block" }}>SOAR</Typography>
                            <Box>
                                {
                                    selectionModel.length > 0 && (
                                        <Tooltip title="Delete Selection">
                                            <IconButton onClick={handleSoarMassDelete}>
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
                                color="primary.main"
                                sx={{
                                    border: 0,
                                    width: "calc(100vw - 125px)",
                                    color: "primary.main",
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