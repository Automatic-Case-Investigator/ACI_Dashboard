import { Helmet } from "react-helmet";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import {
    Box,
    Dialog,
    IconButton,
    Paper,
    Tooltip,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { ConfirmationDialog } from "../components/utils/ConfirmationDialog";
import { red } from "@mui/material/colors";
import RefreshIcon from '@mui/icons-material/Refresh';
import { useCookies } from "react-cookie";

export const Jobs = () => {
    const [cookies, , removeCookies] = useCookies(["token"]);
    const [errorMessage, setErrorMessage] = useState("");
    const [jobList, setJobList] = useState([]);
    const [selectionModel, setSelectionModel] = useState([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [upcomingAction, setUpcomingAction] = useState({});

    // DataGrid column definitions
    const columns = [
        { field: "id", type: "string", headerName: "ID", flex: 0.5 },
        { field: "status", type: "string", headerName: "Status", flex: 0.3 },
        { field: "result", type: "string", headerName: "Result", flex: 0.3 },
        { field: "createdAt", type: "dateTime", headerName: "Created At", flex: 0.4 },
        { field: "finishedAt", type: "dateTime", headerName: "Finished At", flex: 0.4 },
        { field: "elapsedTime", type: "string", headerName: "Elapsed Time (seconds)", flex: 0.3 },
        {
            field: "actions", type: "actions", headerName: "Actions", flex: 0.2,
            renderCell: (params) => (
                <Tooltip title="Delete">
                    <IconButton onClick={() => {
                        scheduleUpcomingAction(handleJobDelete, params);
                        setConfirmDialogOpen(true);
                    }}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            )
        },
    ];

    // Stores the function and arguments to execute after confirmation dialog
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

    // Converts Unix timestamps to JS Date objects for display
    const evaluateTimestamp = (jobs) => {
        return jobs.map(job => ({
            ...job,
            createdAt: new Date(job.createdAt * 1000),
            finishedAt: new Date(job.finishedAt * 1000),
        }));
    };

    // Handles deletion of a single job
    const handleJobDelete = async (params) => {
        const updatedList = [...jobList];
        const index = updatedList.findIndex(job => job.id === params.row.id);
        if (index !== -1) {
            const formData = new FormData();
            formData.append("job_id", params.row.id);

            const response = await fetch(
                process.env.REACT_APP_BACKEND_URL + "jobs/",
                {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${cookies.token}` },
                    body: formData
                }
            );
            const responseJson = await response.json();

            if (responseJson.code === "token_not_valid") {
                removeCookies("token");
                return;
            }

            updatedList.splice(index, 1);
            setJobList(evaluateTimestamp(updatedList));
        }
    };

    // Handles bulk deletion of selected jobs
    const handleJobMassDelete = async () => {
        const updatedList = [];
        const selected = [...selectionModel];

        for (const job of jobList) {
            if (selected.includes(job.id)) {
                const formData = new FormData();
                formData.append("job_id", job.id);

                const response = await fetch(
                    process.env.REACT_APP_BACKEND_URL + "jobs/",
                    {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${cookies.token}` },
                        body: formData
                    }
                );
                const responseJson = await response.json();

                if (responseJson.code === "token_not_valid") {
                    removeCookies("token");
                    return;
                }

                // Remove from selection
                selected.splice(selected.indexOf(job.id), 1);
            } else {
                updatedList.push(job);
            }
        }

        setJobList(evaluateTimestamp(updatedList));
    };

    // Fetch jobs from the backend
    const getJobList = async () => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `jobs/`,
            {
                headers: { "Authorization": `Bearer ${cookies.token}` }
            }
        );
        const rawData = await response.json();

        if (rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        if (rawData.error) {
            setErrorMessage(rawData.error);
        } else {
            setErrorMessage("");
            setJobList(evaluateTimestamp(rawData.jobs));
        }
    };

    useEffect(() => {
        getJobList();
    }, []);

    return (
        <>
            <Helmet>
                <title>Jobs</title>
            </Helmet>
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar names={["Jobs"]} routes={["/jobs"]} />
                <VerticalNavbar />

                <Dialog open={confirmDialogOpen}>
                    <ConfirmationDialog
                        onCancel={() => setConfirmDialogOpen(false)}
                        onContinue={() => {
                            executeUpcomingAction();
                            setConfirmDialogOpen(false);
                        }}
                    />
                </Dialog>

                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                    <Box sx={{ float: "right" }}>
                        {selectionModel.length > 0 && (
                            <Tooltip title="Delete Selection">
                                <IconButton onClick={() => {
                                    scheduleUpcomingAction(handleJobMassDelete);
                                    setConfirmDialogOpen(true);
                                }}>
                                    <DeleteIcon style={{ color: red[500] }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="Refresh">
                            <IconButton onClick={getJobList}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {errorMessage.length === 0 ? (
                        <Paper sx={{ height: 600, width: "calc(100vw - 125px)", marginTop: 5.5 }}>
                            <DataGrid
                                rows={jobList}
                                columns={columns}
                                initialState={{
                                    pagination: {
                                        paginationModel: { pageSize: 10 }
                                    }
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
                    )}
                </Box>
            </Box>
        </>
    );
};
