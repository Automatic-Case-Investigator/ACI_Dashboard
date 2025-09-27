import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Box,
    Dialog,
    IconButton,
    Paper,
    Tooltip,
    Snackbar,
    Button,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowParams, GridRowSelectionModel } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmationDialog } from "../utils/ConfirmationDialog";
import PuffLoader from "react-spinners/PuffLoader";
import { ActionObject, CallbackFunction, TaskData } from "../../types/types";
import { useCookies } from "react-cookie";

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
    onRefresh,
}) => {
    const [formattedTaskList, setFormattedTaskList] = useState<TaskData[]>([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
    const [upcomingAction, setUpcomingAction] = useState<ActionObject>({});
    const [loading, setLoading] = useState(true);
    const [cookies, , removeCookies] = useCookies(["token"]);
    const navigate = useNavigate();

    const scheduleUpcomingAction = (
        func: (...args: any[]) => Promise<void>,
        ...args: any[]
    ) => setUpcomingAction({ func, args });

    const executeUpcomingAction = async () => {
        if (upcomingAction.func) await upcomingAction.func(...(upcomingAction.args || []));
        onRefresh();
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", flex: 0.2 },
        { field: "title", headerName: "Title", flex: 0.6 },
        { field: "group", headerName: "Group", flex: 0.4 },
        { field: "createdAt", headerName: "Created At", flex: 0.4, type: "dateTime" },
        { field: "createdBy", headerName: "Created By", flex: 0.3 },
        {
            field: "actions",
            headerName: "Actions",
            flex: 0.3,
            renderCell: (params) => (
                <>
                    <Tooltip title="View">
                        <IconButton
                            onClick={() =>
                                navigate(
                                    `/organizations/${orgId}/cases/${caseId}/tasks/${params.row.id}`
                                )
                            }
                        >
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            onClick={() => {
                                scheduleUpcomingAction(handleTaskDelete, params);
                                setConfirmDialogOpen(true);
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </>
            ),
        },
    ];

    const handleTaskDelete = async (params: GridRowParams) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("soar_id", soarId);
            formData.append("task_id", params.row.id);

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}soar/task/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${cookies.token}` },
                body: formData,
            });

            const json = await response.json();
            if (json.code === "token_not_valid") return removeCookies("token");
            if (!response.ok) throw new Error("Failed to delete task");

            setFormattedTaskList((prev) => prev.filter((t) => t.id !== params.row.id));
        } catch (e) {
            console.error("Error deleting task:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskMassDelete = async () => {
        setLoading(true);
        try {
            await Promise.all(
                selectionModel.map(async (taskId) => {
                    const formData = new FormData();
                    formData.append("soar_id", soarId);
                    formData.append("task_id", taskId as string);
                    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}soar/task/`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${cookies.token}` },
                        body: formData,
                    });
                    const json = await response.json();
                    if (json.code === "token_not_valid") removeCookies("token");
                })
            );
            setFormattedTaskList((prev) =>
                prev.filter((t) => !selectionModel.includes(t.id))
            );
            setSelectionModel([]);
        } catch (e) {
            console.error("Error deleting tasks:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        if (taskList) {
            setFormattedTaskList(
                taskList.map((t) => ({ ...t, createdAt: new Date(t.createdAt) }))
            );
            setLoading(false);
        }
    }, [taskList]);

    return (
        <>
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <PuffLoader color="#00ffea" />
                </Box>
            ) : (
                <>
                    <Snackbar
                        open={selectionModel.length > 0}
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                        message={`${selectionModel.length} task(s) selected`}
                        action={
                            <Button
                                color="error"
                                variant="contained"
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={() => {
                                    scheduleUpcomingAction(handleTaskMassDelete);
                                    setConfirmDialogOpen(true);
                                }}
                            >
                                Delete
                            </Button>
                        }
                    />

                    <Dialog open={confirmDialogOpen}>
                        <ConfirmationDialog
                            onCancel={() => setConfirmDialogOpen(false)}
                            onContinue={() => {
                                executeUpcomingAction();
                                setConfirmDialogOpen(false);
                            }}
                        />
                    </Dialog>

                    <Paper
                        sx={{
                            height: "calc(100vh - 200px)",
                            width: "calc(100vw - 160px)",
                        }}
                    >
                        <DataGrid
                            rows={formattedTaskList}
                            columns={columns}
                            checkboxSelection
                            rowSelectionModel={selectionModel}
                            onRowSelectionModelChange={setSelectionModel}
                            disableRowSelectionOnClick
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            pageSizeOptions={[10]}
                            onCellDoubleClick={(params, event) => {
                                event.defaultMuiPrevented = true;
                                navigate(
                                    `/organizations/${orgId}/cases/${caseId}/tasks/${params.id}`
                                );
                            }}
                            sx={{
                                border: 0,
                                width: "calc(100vw - 160px)",
                                "& .MuiDataGrid-checkboxInput": {
                                    color: "primary.main",
                                    "&.Mui-checked": { color: "secondary.main" },
                                },
                            }}
                        />
                    </Paper>
                </>
            )}
        </>
    );
};
