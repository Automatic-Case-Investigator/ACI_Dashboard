import { Helmet } from "react-helmet";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, Dialog, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { ConfirmationDialog } from "../components/utils/ConfirmationDialog";
import { red } from "@mui/material/colors";
import RefreshIcon from '@mui/icons-material/Refresh';


export const Jobs = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const [jobList, setJobList] = useState([]);
    const [selectionModel, setSelectionModel] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [upcomingAction, setUpcomingAction] = useState({});

    const columns = [
        { field: "id", type: "string", headerName: "ID", width: 300 },
        { field: "status", type: "string", headerName: "Status", width: 120 },
        { field: "result", type: "string", headerName: "Result", width: 120 },
        { field: "createdAt", type: "dateTime", headerName: "Created At", width: 250 },
        { field: "finishedAt", type: "dateTime", headerName: "Finished At", width: 250 },
        { field: "elapsedTime", type: "string", headerName: "Elapsed Time (seconds)", width: 300 },
        {
            field: "actions", type: "actions", headerName: "Actions", width: 100,
            renderCell: (params) => (
                <>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => {
                            scheduleUpcomingAction(handleJobDelete, params);
                            setConfirmDialogOpen(true);
                        }}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </>
            )
        },
    ]

    const scheduleUpcomingAction = (func, ...args) => {
        setUpcomingAction({ func, args });
    };

    const executeUpcomingAction = async () => {
        if (upcomingAction) {
            const { func, args } = upcomingAction;
            await func(...args);
        }
        getJobList();
    };

    const evaluateTimestamp = (jobs) => {
        var output = []
        for (let job of jobs) {
            job.createdAt = new Date(job.createdAt * 1000)
            job.finishedAt = new Date(job.finishedAt * 1000)
            output.push(job)
        }
        return output;
    }

    const handleJobDelete = async (params) => {
        const updatedList = Object.assign([], jobList);
        for (let index = 0; index < updatedList.length; index++) {
            if (updatedList[index].id === params.row.id) {
                const formData = new FormData();
                formData.append("job_id", params.row.id);

                await fetch(
                    process.env.REACT_APP_BACKEND_URL + "jobs/",
                    { method: "DELETE", body: formData }
                );

                updatedList.splice(index, 1);
                break;
            }
        }

        setJobList(evaluateTimestamp(updatedList));
    }

    const handleJobMassDelete = async () => {
        var updatedList = [];
        const currentSelectionModel = Object.assign([], selectionModel);
        for (let index = 0; index < jobList.length; index++) {
            let deleted = false;
            for (let selectionModelIndex = 0; selectionModelIndex < currentSelectionModel.length; selectionModelIndex++) {
                if (jobList[index].id === currentSelectionModel[selectionModelIndex]) {
                    const formData = new FormData();
                    formData.append("job_id", jobList[index].id);

                    await fetch(
                        process.env.REACT_APP_BACKEND_URL + "jobs/",
                        { method: "DELETE", body: formData }
                    );
                    currentSelectionModel.splice(selectionModelIndex, 1);
                    deleted = true;
                    break;
                }
            }
            if (!deleted) {
                updatedList.push(jobList[index]);
            }
        }
        setJobList(evaluateTimestamp(updatedList));
    }

    const getJobList = async () => {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + `jobs/`);
        const rawData = await response.json();

        if (rawData["error"]) {
            setErrorMessage(rawData["error"])
        } else {
            setErrorMessage("")

            setJobList(evaluateTimestamp(rawData["jobs"]))
        }
    }

    useEffect(() => {
        getJobList();
    }, [])
    return (
        <>
            <Helmet>
                <title>Jobs</title>
            </Helmet>
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar names={["Jobs"]} routes={["/jobs"]} />
                <VerticalNavbar />
                <Dialog open={confirmDialogOpen}>
                    <ConfirmationDialog onCancel={() => { setConfirmDialogOpen(false) }} onContinue={() => { executeUpcomingAction(); setConfirmDialogOpen(false) }} />
                </Dialog>
                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                    <Box sx={{ float: "right" }}>
                        {
                            selectionModel.length > 0 && (

                                <Tooltip title="Delete Selection">
                                    <IconButton onClick={() => {
                                        scheduleUpcomingAction(handleJobMassDelete)
                                        setConfirmDialogOpen(true)
                                    }}>
                                        <DeleteIcon style={{ color: red[500] }} />
                                    </IconButton>
                                </Tooltip>
                            )
                        }
                        <Tooltip title="Refresh">
                            <IconButton onClick={getJobList}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    {
                        errorMessage.length === 0 ? (
                            <Paper sx={{ height: 600, width: "calc(100vw - 125px)", marginTop: 5 }}>
                                <DataGrid
                                    rows={jobList}
                                    columns={columns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 10,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[10]}
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
                        ) : (
                            <Typography variant="body1">{errorMessage}</Typography>
                        )
                    }
                </Box>
            </Box>
        </>
    )
}