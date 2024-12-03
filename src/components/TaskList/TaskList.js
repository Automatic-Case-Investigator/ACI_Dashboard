import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Dialog, IconButton, Paper, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ConfirmationDialog } from '../utils/ConfirmationDialog';
import { red } from "@mui/material/colors";
import PuffLoader from "react-spinners/PuffLoader"


export const TaskList = ({ taskList, soarId, orgId, caseId, onRefresh }) => {
    const [formattedTaskList, setFormattedTaskList] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectionModel, setSelectionModel] = useState([]);
    const [upcomingAction, setUpcomingAction] = useState({});
    const [loading, setLoading] = useState(true);

    const scheduleUpcomingAction = (func, ...args) => {
        setUpcomingAction({ func, args });
    };
    const executeUpcomingAction = async () => {
        if (upcomingAction) {
            const { func, args } = upcomingAction;
            await func(...args);
        }
        onRefresh();
    };

    const navigate = useNavigate();
    const columns = [
        { field: "id", type: "string", headerName: "ID", width: 150 },
        { field: "title", type: "string", headerName: "Title", width: 350 },
        { field: "group", type: "string", headerName: "Group", width: 300 },
        { field: "createdAt", type: "dateTime", headerName: "Created At", width: 300 },
        { field: "createdBy", type: "string", headerName: "Created By", width: 200 },
        {
            field: "actions",
            type: "actions",
            width: 150,
            renderCell: (params) => (
                <>
                    <Tooltip title="View">
                        <IconButton onClick={() => { navigate(`/organizations/${orgId}/cases/${caseId}/tasks/${params.row.id}`) }}>
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

    const handleTaskDelete = async (params) => {
        setLoading(true);
        const updatedList = Object.assign([], taskList);
        for (let index = 0; index < updatedList.length; index++) {
            if (updatedList[index].id === params.row.id) {
                const formData = new FormData();
                formData.append("soar_id", soarId);
                formData.append("task_id", params.row.id);

                await fetch(
                    process.env.REACT_APP_BACKEND_URL + "soar/task/",
                    { method: "DELETE", body: formData }
                );

                updatedList.splice(index, 1);
                break;
            }
        }

        setFormattedTaskList(updatedList);
        setLoading(false);
    }

    const handleTaskMassDelete = async () => {
        setLoading(true);
        var updatedList = [];
        const currentSelectionModel = Object.assign([], selectionModel);
        for (let index = 0; index < taskList.length; index++) {
            let deleted = false;
            for (let selectionModelIndex = 0; selectionModelIndex < currentSelectionModel.length; selectionModelIndex++) {
                if (taskList[index].id === currentSelectionModel[selectionModelIndex]) {
                    const formData = new FormData();
                    formData.append("soar_id", soarId);
                    formData.append("task_id", currentSelectionModel[selectionModelIndex]);

                    await fetch(
                        process.env.REACT_APP_BACKEND_URL + "soar/task/",
                        { method: "DELETE", body: formData }
                    );
                    currentSelectionModel.splice(selectionModelIndex, 1);
                    deleted = true;
                    break;
                }
            }
            if (!deleted) {
                updatedList.push(taskList[index]);
            }
        }
        setFormattedTaskList(updatedList);
        setLoading(false);
    }

    useEffect(() => {
        setLoading(true);
        if (taskList) {
            for (let index = 0; index < taskList.length; index++) {
                taskList[index].createdAt = new Date(taskList[index].createdAt)
            }
            setFormattedTaskList(taskList);
            setLoading(false);
        }
    }, [taskList]);
    return (
        <>
            {
                !loading ? (
                    <>
                        {
                            selectionModel.length > 0 && (

                                <Box sx={{ float: "right" }}>
                                    <Tooltip title="Delete Selection">
                                        <IconButton onClick={() => {
                                            scheduleUpcomingAction(handleTaskMassDelete)
                                            setConfirmDialogOpen(true)
                                        }}>
                                            <DeleteIcon style={{ color: red[500] }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )
                        }

                        <Dialog open={confirmDialogOpen}>
                            <ConfirmationDialog onCancel={() => { setConfirmDialogOpen(false) }} onContinue={() => { executeUpcomingAction(); setConfirmDialogOpen(false) }} />
                        </Dialog>
                        <Paper sx={{ marginTop: 2, height: 400, width: "calc(100vw - 160px)" }}>
                            <DataGrid
                                rows={formattedTaskList}
                                columns={columns}
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 5,
                                        },
                                    },
                                }}
                                pageSizeOptions={[5]}
                                checkboxSelection
                                rowSelectionModel={selectionModel}
                                onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
                                disableRowSelectionOnClick
                                color="primary.main"
                                sx={{
                                    border: 0,
                                    width: "calc(100vw - 160px)",
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
                ) : (
                    <PuffLoader color="#00ffea" cssOverride={{ marginTop: 16 }} />
                )
            }
        </>
    );
}