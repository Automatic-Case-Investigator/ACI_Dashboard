import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Dialog, IconButton, Paper, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridColDef, GridRowParams, GridRowSelectionModel } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ConfirmationDialog } from '../utils/ConfirmationDialog';
import { red } from "@mui/material/colors";
import PuffLoader from "react-spinners/PuffLoader";
import { ActionObject, CallbackFunction, TaskData } from '../../types/types';
import { useCookies } from 'react-cookie';


interface TaskListProps {
    taskList: TaskData[];
    soarId: string;
    orgId: string;
    caseId: string;
    onRefresh: CallbackFunction;
}

export const TaskList: React.FC<TaskListProps> = ({
    taskList,
    soarId,
    orgId,
    caseId,
    onRefresh
}) => {
    const [formattedTaskList, setFormattedTaskList] = useState<TaskData[]>([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
    const [upcomingAction, setUpcomingAction] = useState<ActionObject>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [cookies, _setCookies, removeCookies] = useCookies(["token"]);

    const scheduleUpcomingAction = (func: (...args: any[]) => Promise<void>, ...args: any[]) => {
        setUpcomingAction({ func, args });
    };

    const executeUpcomingAction = async () => {
        if (upcomingAction.func) {
            await upcomingAction.func(...(upcomingAction.args || []));
        }
        onRefresh();
    };

    const navigate = useNavigate();

    const columns: GridColDef[] = [
        { field: "id", type: "string", headerName: "ID", flex: 0.2 },
        { field: "title", type: "string", headerName: "Title", flex: 0.6 },
        { field: "group", type: "string", headerName: "Group", flex: 0.4 },
        { field: "createdAt", type: "dateTime", headerName: "Created At", flex: 0.4 },
        { field: "createdBy", type: "string", headerName: "Created By", flex: 0.3 },
        {
            field: "actions",
            type: "actions",
            flex: 0.3,
            renderCell: (params: any) => (
                <>
                    <Tooltip title="View">
                        <IconButton onClick={() => navigate(`/organizations/${orgId}/cases/${caseId}/tasks/${params.row.id}`)}>
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => {
                            scheduleUpcomingAction(handleTaskDelete, params);
                            setConfirmDialogOpen(true);
                        }}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </>
            )
        }
    ];

    const handleTaskDelete = async (params: GridRowParams) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("soar_id", soarId);
            formData.append("task_id", params.row.id);

            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}soar/task/`,
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
                throw new Error('Failed to delete task');
            }

            const updatedList = formattedTaskList.filter(task => task.id !== params.row.id);
            setFormattedTaskList(updatedList);
        } catch (error) {
            console.error("Error deleting task:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskMassDelete = async () => {
        setLoading(true);
        try {
            const deletePromises = selectionModel.map(async (taskId) => {
                const formData = new FormData();
                formData.append("soar_id", soarId);
                formData.append("task_id", taskId as string);

                const response = await fetch(
                    `${process.env.REACT_APP_BACKEND_URL}soar/task/`,
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

            const updatedList = formattedTaskList.filter(
                task => !selectionModel.includes(task.id)
            );
            setFormattedTaskList(updatedList);
            setSelectionModel([]);
        } catch (error) {
            console.error("Error deleting tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        if (taskList) {
            const formattedTasks = taskList.map(task => ({
                ...task,
                createdAt: new Date(task.createdAt)
            }));
            setFormattedTaskList(formattedTasks);
            setLoading(false);
        }
    }, [taskList]);

    return (
        <>
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
                                    scheduleUpcomingAction(handleTaskMassDelete);
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

                    <Paper sx={{ marginTop: 2, height: "calc(100vh - 200px)", width: "calc(100vw - 160px)" }}>
                        <DataGrid
                            rows={formattedTaskList}
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
    );
};