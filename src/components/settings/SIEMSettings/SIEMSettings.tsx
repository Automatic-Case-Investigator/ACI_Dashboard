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
import { EditSIEMInfoDialog } from "./EditSIEMInfoDialog";
import { SIEM_CHOICES } from "../../../constants/platform-choices";
import { NewSIEMInfoDialog } from "./NewSIEMInfoDialog";
import { ConfirmationDialog } from "../../utils/ConfirmationDialog";
import { useCookies } from "react-cookie";
import { SIEMData } from "../../../types/types";

interface ActionObject {
    func?: (...args: any[]) => Promise<void>;
    args?: any[];
}

export const SIEMSettings = () => {
    const [cookies, _setCookie, removeCookies] = useCookies(["token"]);
    const [siemsData, setSiemsData] = useState<SIEMData[]>([]);
    const [selectedSiemData, setSelectedSiemData] = useState<SIEMData>();
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
    const [siemsLoading, setSiemsLoading] = useState<boolean>(true);

    const [newDialogOpen, setNewDialogOpen] = useState<boolean>(false);
    const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [upcomingAction, setUpcomingAction] = useState<ActionObject>({});

    const scheduleUpcomingAction = (func: (...args: any[]) => Promise<void>, ...args: any[]) => {
        setUpcomingAction({ func, args });
    };

    const executeUpcomingAction = async () => {
        if (upcomingAction.func) {
            await upcomingAction.func(...(upcomingAction.args || []));
        }
    };

    const handleEditDialogOpen = (params: any) => {
        setSelectedSiemData(params.row as SIEMData);
        setEditDialogOpen(true);
    };

    const handleEditDialogClose = () => {
        setSelectedSiemData(undefined);
        setEditDialogOpen(false);
    };

    const updateSiemsData = async () => {
        setSiemsLoading(true);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}siem/siem_info/`,
                {
                    headers: {
                        "Authorization": `Bearer ${cookies.token}`
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch SIEM data');
            }

            const rawData = await response.json();

            if (rawData.code && rawData.code === "token_not_valid") {
                removeCookies("token");
                return;
            }

            const targetSIEM = JSON.parse(localStorage.getItem("targetSIEM") || 'null');
            const output: SIEMData[] = rawData.message.map((siem: any) => ({
                id: siem.id,
                name: siem.name,
                type: SIEM_CHOICES[siem.siem_type] || "Unknown",
                url: `${siem.protocol}//${siem.hostname}${siem.base_dir}`,
                useAPIKey: siem.use_api_key,
                authType: siem.use_api_key ? "API Key" : "Username / Password",
                apiKey: siem.api_key,
                username: siem.username,
                password: siem.password,
                isTarget: targetSIEM ? siem.id === targetSIEM.id : false
            }));

            setSiemsData(output);
        } catch (error) {
            console.error("Error fetching SIEM data:", error);
        } finally {
            setSiemsLoading(false);
        }
    };

    const handleSiemSetTarget = (params: any) => {
        const updatedData = siemsData.map(siem => ({
            ...siem,
            isTarget: siem.id === params.row.id
        }));
        
        const targetSIEM = updatedData.find(siem => siem.id === params.row.id);
        if (targetSIEM) {
            localStorage.setItem("targetSIEM", JSON.stringify(targetSIEM));
        }
        
        setSiemsData(updatedData);
    };

    const handleSiemDelete = async (params: GridRowParams) => {
        try {
            const formData = new FormData();
            formData.append("siem_id", params.row.id.toString());

            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}siem/siem_info/`,
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

            const deletedItem = siemsData.find(siem => siem.id === params.row.id);
            if (deletedItem?.isTarget) {
                localStorage.removeItem("targetSIEM");
            }

            setSiemsData(siemsData.filter(siem => siem.id !== params.row.id));
        } catch (error) {
            console.error("Error deleting SIEM:", error);
        }
    };

    const handleSiemMassDelete = async () => {
        try {
            const deletePromises = selectionModel.map(async (id) => {
                const formData = new FormData();
                formData.append("siem_id", id.toString());

                return fetch(
                    `${process.env.REACT_APP_BACKEND_URL}siem/siem_info/`,
                    {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${cookies.token}`
                        },
                        body: formData
                    }
                );
            });

            await Promise.all(deletePromises);

            const deletedTarget = siemsData.some(
                siem => selectionModel.includes(siem.id) && siem.isTarget
            );

            if (deletedTarget) {
                localStorage.removeItem("targetSIEM");
            }

            setSiemsData(siemsData.filter(siem => !selectionModel.includes(siem.id)));
            setSelectionModel([]);
        } catch (error) {
            console.error("Error mass deleting SIEMs:", error);
        }
    };

    const handleSiemCreate = async (siemInfo: SIEMData) => {
        try {
            const requestBody = new FormData();
            const urlObj = new URL(siemInfo.url);
            
            requestBody.append("name", siemInfo.name);
            requestBody.append("siem_type", Object.keys(SIEM_CHOICES).find(key => SIEM_CHOICES[key] === siemInfo.type) || '');
            requestBody.append("protocol", urlObj.protocol);
            requestBody.append("hostname", urlObj.host);
            requestBody.append("base_dir", urlObj.pathname);
            requestBody.append("use_api_key", String(siemInfo.useAPIKey));
            
            if (siemInfo.useAPIKey && siemInfo.apiKey) {
                requestBody.append("api_key", siemInfo.apiKey);
            } else {
                requestBody.append("username", siemInfo.username || '');
                requestBody.append("password", siemInfo.password || '');
            }

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}siem/siem_info/`, {
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
            
            await updateSiemsData();
        } catch (error) {
            console.error("Error creating SIEM:", error);
        }
    };

    const handleSiemEdit = async (updatedInfo: SIEMData) => {
        try {
            if (!updatedInfo.id) return;

            const requestBody = new FormData();
            const urlObj = new URL(updatedInfo.url);
            
            requestBody.append("siem_id", updatedInfo.id.toString());
            requestBody.append("name", updatedInfo.name);
            requestBody.append("siem_type", Object.keys(SIEM_CHOICES).find(key => SIEM_CHOICES[key] === updatedInfo.type) || '');
            requestBody.append("protocol", urlObj.protocol);
            requestBody.append("hostname", urlObj.host);
            requestBody.append("base_dir", urlObj.pathname);
            requestBody.append("use_api_key", String(updatedInfo.useAPIKey));
            
            if (updatedInfo.useAPIKey && updatedInfo.apiKey) {
                requestBody.append("api_key", updatedInfo.apiKey);
            } else {
                requestBody.append("username", updatedInfo.username || '');
                requestBody.append("password", updatedInfo.password || '');
            }

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}siem/siem_info/`, {
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

            await updateSiemsData();
        } catch (error) {
            console.error("Error updating SIEM:", error);
        }
    };

    const columns: GridColDef[] = [
        { field: "id", type: "number", headerName: "ID", flex: 0.1 },
        { field: "name", type: "string", headerName: "Name", flex: 0.6 },
        { field: "type", type: "string", headerName: "Type", flex: 0.3 },
        { field: "url", type: "string", headerName: "URL", flex: 0.6 },
        { field: "authType", type: "string", headerName: "Authentication type", flex: 0.6 },
        {
            field: "isTarget", 
            type: "boolean", 
            headerName: "Is Target", 
            flex: 0.2,
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
                        <IconButton onClick={() => handleSiemSetTarget(params)}>
                            <LocationSearchingIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditDialogOpen(params)}>
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
        if (siemsData.length === 1 && !siemsData[0].isTarget) {
            const updatedData = [...siemsData];
            updatedData[0].isTarget = true;
            localStorage.setItem("targetSIEM", JSON.stringify(updatedData[0]));
            setSiemsData(updatedData);
        } else if (siemsData.length > 0) {
            const targetSIEM = JSON.parse(localStorage.getItem("targetSIEM") || 'null');
            if (targetSIEM) {
                const updatedTarget = siemsData.find(siem => siem.id === targetSIEM.id);
                if (updatedTarget) {
                    localStorage.setItem("targetSIEM", JSON.stringify(updatedTarget));
                }
            }
        }
    }, [siemsData]);

    return (
        <>
            <Dialog open={newDialogOpen} onClose={() => setNewDialogOpen(false)} fullWidth>
                <NewSIEMInfoDialog 
                    onClose={() => setNewDialogOpen(false)} 
                    onCreate={handleSiemCreate} 
                />
            </Dialog>

            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} fullWidth>
                <ConfirmationDialog 
                    onCancel={() => setConfirmDialogOpen(false)} 
                    onContinue={() => {
                        executeUpcomingAction();
                        setConfirmDialogOpen(false);
                    }} 
                />
            </Dialog>

            <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth>
                <EditSIEMInfoDialog 
                    selectedSiemData={selectedSiemData} 
                    onClose={handleEditDialogClose} 
                    onSave={handleSiemEdit} 
                />
            </Dialog>

            {siemsLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6">SIEM Information</Typography>
                    <PuffLoader color="#00ffea" size={30} />
                </Box>
            ) : (
                <>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                        <Typography variant="h6">SIEM Information</Typography>
                        <Box>
                            {selectionModel.length > 0 && (
                                <Tooltip title="Delete Selection">
                                    <IconButton onClick={() => {
                                        scheduleUpcomingAction(handleSiemMassDelete);
                                        setConfirmDialogOpen(true);
                                    }}>
                                        <DeleteIcon style={{ color: red[500] }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Tooltip title="Add New">
                                <IconButton onClick={() => setNewDialogOpen(true)}>
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
                            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
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
            )}
        </>
    );
};