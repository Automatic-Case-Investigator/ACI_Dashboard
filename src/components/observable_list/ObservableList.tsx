import { useEffect, useState } from "react";
import { ActionObject, CallbackFunction, ObservableData } from "../../types/types";
import { DataGrid, GridColDef, GridRowParams, GridRowSelectionModel } from "@mui/x-data-grid";
import { Box, Dialog, IconButton, Paper, Tooltip } from "@mui/material";
import { useCookies } from "react-cookie";
import DeleteIcon from "@mui/icons-material/Delete";
import PuffLoader from "react-spinners/PuffLoader";
import { ConfirmationDialog } from "../utils/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { red } from "@mui/material/colors";


interface ObservableListProps {
    observableList: ObservableData[];
    soarId: string;
    orgId: string;
    caseId: string;
    onRefresh: CallbackFunction;
}

export const ObservableList: React.FC<ObservableListProps> = ({ observableList, soarId, orgId, caseId, onRefresh }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [cookies, _setCookies, removeCookies] = useCookies(["token"]);
    const [upcomingAction, setUpcomingAction] = useState<ActionObject>({});
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
    const [formattedObservableList, setFormattedObservableList] = useState<ObservableData[]>([]);

    const scheduleUpcomingAction = (func: (...args: any[]) => Promise<void>, ...args: any[]) => {
        setUpcomingAction({ func, args });
    };

    const executeUpcomingAction = async () => {
        if (upcomingAction.func) {
            await upcomingAction.func(...(upcomingAction.args || []));
        }
        onRefresh();
    };

    const handleObservableDelete = async (params: GridRowParams) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("soar_id", soarId);
            formData.append("observable_id", params.row.id);

            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}soar/observables/`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${cookies.token}`
                    },
                    body: formData,
                }
            );

            const responseJson = await response.json();

            if (responseJson.code === "token_not_valid") {
                removeCookies("token");
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to delete observable');
            }

            const updatedList = formattedObservableList.filter(observable => observable.id !== params.row.id);
            setFormattedObservableList(updatedList);
        } catch (error) {
            console.error("Error deleting observables:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleObservablesMassDelete = async () => {
        setLoading(true);
        try {
            const deletePromises = selectionModel.map(async (observableId) => {
                const formData = new FormData();
                formData.append("soar_id", soarId);
                formData.append("observable_id", observableId as string);

                const response = await fetch(
                    `${process.env.REACT_APP_BACKEND_URL}soar/observables/`,
                    {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${cookies.token}`
                        },
                        body: formData,
                    }
                );

                const responseJson = await response.json();

                if (responseJson.code === "token_not_valid") {
                    removeCookies("token");
                    return;
                }
            });

            await Promise.all(deletePromises);

            const updatedList = formattedObservableList.filter(
                observable => !selectionModel.includes(observable.id)
            );
            setFormattedObservableList(updatedList);
            setSelectionModel([]);
        } catch (error) {
            console.error("Error deleting observables:", error);
        } finally {
            setLoading(false);
        }
    };

    const columns: GridColDef[] = [
        { field: "id", type: "string", headerName: "ID", flex: 0.4 },
        { field: "type", type: "string", headerName: "Type", flex: 0.4 },
        { field: "dataType", type: "string", headerName: "Data Type", flex: 0.3 },
        { field: "data", type: "string", headerName: "Data", flex: 0.6 },
        { field: "ioc", type: "boolean", headerName: "IoC?", flex: 0.2 },
        { field: "createdAt", type: "dateTime", headerName: "Created At", flex: 0.6 },
        { field: "createdBy", type: "string", headerName: "Created By", flex: 0.6 },
        {
            field: "actions",
            type: "actions",
            flex: 0.3,
            renderCell: (params: any) => (
                <>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => {
                            scheduleUpcomingAction(handleObservableDelete, params);
                            setConfirmDialogOpen(true);
                        }}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </>
            )
        }
    ];

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        if (observableList) {
            const formattedObservables = observableList.map(task => ({
                ...task,
                createdAt: new Date(task.createdAt),
                startDate: new Date(task.startDate)
            }));
            setFormattedObservableList(formattedObservables);
            setLoading(false);
        }
    }, [observableList]);

    return <>
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <PuffLoader color="#00ffea" />
            </Box>
        ) : (
            <>
                {selectionModel.length > 0 && (
                    <Box sx={{ float: "right" }}>
                        <Tooltip title="Delete Selection">
                            <IconButton onClick={() => {
                                scheduleUpcomingAction(handleObservablesMassDelete);
                                setConfirmDialogOpen(true);
                            }}>
                                <DeleteIcon style={{ color: red[500] }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                <Dialog open={confirmDialogOpen}>
                    <ConfirmationDialog
                        onCancel={() => setConfirmDialogOpen(false)}
                        onContinue={() => {
                            executeUpcomingAction();
                            setConfirmDialogOpen(false);
                        }}
                    />
                </Dialog>

                <Paper sx={{ marginTop: selectionModel.length > 0 ? 5 : 2, height: "calc(100vh - 200px)", width: "calc(100vw - 160px)" }}>
                    <DataGrid
                        rows={formattedObservableList}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 5 },
                            },
                        }}
                        pageSizeOptions={[5]}
                        checkboxSelection
                        rowSelectionModel={selectionModel}
                        onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
                        disableRowSelectionOnClick
                        onCellDoubleClick={(params: any, event) => {
                            event.defaultMuiPrevented = true;
                            navigate(`/organizations/${orgId}/cases/${caseId}/tasks/${params.id}`)
                        }}
                        sx={{
                            border: 0,
                            width: "calc(100vw - 160px)",
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
}