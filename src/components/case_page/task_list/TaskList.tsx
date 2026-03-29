import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Dialog,
    IconButton,
    Tooltip,
} from "@mui/material";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useState } from "react";
import { ConfirmationDialog } from "../../utils/ConfirmationDialog";
import { ActionObject, CallbackFunction, TaskData } from "../../../types/types";
import { useCookies } from "react-cookie";
import { TaskPreview } from "../task_preview/TaskPreview";
import { DataGridList } from "../../utils/DataGridList";

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
    const [previewTaskId, setPreviewTaskId] = useState<string>("");
    const [taskPreviewOpen, setTaskPreviewOpen] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [upcomingAction, setUpcomingAction] = useState<ActionObject>({});
    const [cookies, , removeCookies] = useCookies(["token"]);

    const scheduleUpcomingAction = (
        func: (...args: any[]) => Promise<void>,
        ...args: any[]
    ) => setUpcomingAction({ func, args });

    const executeUpcomingAction = async () => {
        if (upcomingAction.func) await upcomingAction.func(...(upcomingAction.args || []));
        onRefresh();
    };

    const handleTaskDelete = async (params: GridRowParams) => {
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
    };

    const handleMassTaskDelete = async (selectedIds: string[]) => {
        const deletePromises = selectedIds.map(async (id) => {
            const formData = new FormData();
            formData.append("soar_id", soarId);
            formData.append("task_id", id);

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}soar/task/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${cookies.token}` },
                body: formData,
            });

            const json = await response.json();
            if (json.code === "token_not_valid") return removeCookies("token");
            if (!response.ok) throw new Error(`Failed to delete task ${id}`);
        });

        await Promise.all(deletePromises);
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
                    <Tooltip title="Preview">
                        <IconButton
                            onClick={() => {
                                setPreviewTaskId(params.row.id);
                                setTaskPreviewOpen(true);
                            }
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

    return (
        <>
            <Dialog open={confirmDialogOpen}>
                <ConfirmationDialog
                    onCancel={() => setConfirmDialogOpen(false)}
                    onContinue={() => {
                        executeUpcomingAction();
                        setConfirmDialogOpen(false);
                    }}
                />
            </Dialog>

            <TaskPreview open={taskPreviewOpen} onClose={() => setTaskPreviewOpen(false)} orgId={orgId} caseId={caseId} taskId={previewTaskId} />

            <DataGridList
                data={taskList}
                columns={columns}
                pageSize={10}
                navigatePath={(id) => `/organizations/${orgId}/cases/${caseId}/tasks/${id}`}
                onMassDelete={handleMassTaskDelete}
                enableSelection={true}
            />
        </>
    );
};