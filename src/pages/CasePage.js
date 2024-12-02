import { Box, Button, Divider, IconButton, Snackbar, Tooltip, Typography } from "@mui/material";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { useNavigate, useParams } from "react-router-dom";
import MarkdownPreview from '@uiw/react-markdown-preview';
import RefreshIcon from '@mui/icons-material/Refresh';
import PuffLoader from "react-spinners/PuffLoader";
import { TaskList } from "../components/TaskList/TaskList";
import { darkTheme } from "../themes/darkTheme";
import TabContext from '@mui/lab/TabContext';
import { useEffect, useState } from "react";
import TabPanel from '@mui/lab/TabPanel';
import Alert from '@mui/material/Alert';
import TabList from '@mui/lab/TabList';
import { Helmet } from "react-helmet";
import Tab from '@mui/material/Tab';
import { debounce } from 'lodash';

import "../css/markdown.css"

export const CasePage = () => {
    const { orgId, caseId } = useParams();
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSuccessful, setSnackbarSuccessful] = useState(true);
    const [caseData, setCaseData] = useState();
    const [taskList, setTaskList] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [targetSOAR, setTargetSOAR] = useState(() => {
        const saved = localStorage.getItem("targetSOAR");
        const initialValue = JSON.parse(saved);
        return initialValue || null;
    });

    // component open states
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const getCaseData = async () => {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/case/?soar_id=${targetSOAR.id}&case_id=${caseId}`);
        const rawData = await response.json();

        if (rawData["error"]) {
            setErrorMessage(rawData["error"])
        } else {
            setErrorMessage("")
            setCaseData(rawData)
        }
    }

    const getTaskList = async () => {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/task/?soar_id=${targetSOAR.id}&org_id=${orgId}&case_id=${caseId}`);
        const rawData = await response.json();

        if (rawData["error"]) {
            setErrorMessage(rawData["error"])
        } else {
            setErrorMessage("")
            setTaskList(rawData["tasks"])
        }
    }

    const generateTask = async () => {
        const requestBody = new FormData();
        requestBody.append("soar_id", targetSOAR.id);
        requestBody.append("case_id", caseId);

        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `soar/task_generator/`,
            {
                method: "POST",
                body: requestBody
            }
        );
        const rawData = await response.json();
        if (rawData.message && rawData.message === "Success") {
            setSnackbarMessage("Successfully created task generation job. Check jobs page for details.");
            setSnackbarSuccessful(true);
            setSnackbarOpen(true);
        } else if (rawData.error) {
            setSnackbarMessage(rawData.error);
            setSnackbarSuccessful(false);
            setSnackbarOpen(true);
        } else {
            setSnackbarMessage("Failed communicating with the backend. contact administrators for help.");
            setSnackbarSuccessful(false);
            setSnackbarOpen(true);
        }
    }

    const refreshTasks = () => {
        getCaseData();
        getTaskList();
    }
    
    const refresh = async () => {
        setLoading(true);
        await refreshTasks();
        setLoading(false);
    }

    const debouncedGenerateTask = debounce(generateTask, 300);

    useEffect(() => {
        if (!targetSOAR) {
            return;
        }

        refresh();
    }, [targetSOAR]);

    return (
        <>
            {
                caseData && (
                    <Helmet>
                        <title>{caseData.title}</title>
                    </Helmet>
                )
            }
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar
                    names={["Organizations", `${orgId}`, "cases", `${caseId}`]}
                    routes={["/organizations", `/organizations/${orgId}/cases`, `/organizations/${orgId}/cases`, `/organizations/${orgId}/cases/${caseId}`]} />
                <VerticalNavbar />
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={5000}
                    onClose={() => { setSnackbarOpen(false) }}>
                    <Alert
                        onClose={() => { setSnackbarOpen(false) }}
                        severity={snackbarSuccessful ? "success" : "error"}
                        variant="filled"
                        sx={{ width: '100%', color: "primary.main" }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5, width: "calc(100vw - 110px)" }}>
                    {
                        targetSOAR ? (
                            errorMessage.length > 0 ? (
                                <Typography variant="body1">{errorMessage}</Typography>
                            ) : (
                                <>
                                    {
                                        caseData && !loading ? (
                                            <>
                                                <Box>
                                                    <Typography variant="body1" sx={{ display: "inline-block", overflow: "scroll" }}>{caseData.title}</Typography>
                                                    <Tooltip title="Refresh">
                                                        <IconButton sx={{ float: "right" }} onClick={refresh}>
                                                            <RefreshIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                                <TabContext value={currentTab}>
                                                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                                        <TabList indicatorColor="secondary" onChange={(_, newValue) => { setCurrentTab(newValue) }} aria-label="lab API tabs example">
                                                            <Tab label="General" value={0} />
                                                            <Tab label="Tasks Generation" value={1} />
                                                            <Tab label="Automatic Investigation" value={2} />
                                                        </TabList>
                                                    </Box>
                                                    <TabPanel value={0}><MarkdownPreview source={caseData.description} style={{ width: "calc(100vw - 150px)", background: "transparent", color: darkTheme.palette.primary.main }} /></TabPanel>
                                                    <TabPanel value={1}>
                                                        <Typography sx={{ paddingBottom: 1 }}>The task generation AI is trained specifically to analyze security cases and generate meaningful tasks suited for SOC analysis.</Typography>
                                                        <Button size="small" color="secondary" variant="outlined" onClick={debouncedGenerateTask}>Generate Tasks</Button>
                                                        <Divider sx={{ paddingTop: 1, marginBottom: 2 }} />
                                                        {
                                                            taskList.length === 0 ? (
                                                                <Typography>No tasks were found</Typography>
                                                            ) : (
                                                                <>
                                                                    <Typography>Tasks:</Typography>
                                                                    <TaskList taskList={taskList} soarId={targetSOAR.id} orgId={orgId} caseId={caseId} onRefresh={refresh}/>
                                                                </>
                                                            )
                                                        }
                                                    </TabPanel>
                                                    <TabPanel value={2}>
                                                        <Typography sx={{ paddingBottom: 1 }}>The Automatic Investigation System is a system of AI trained to perform operations to analyze security incidents and generate meaningful analysis suited for SOC.</Typography>
                                                        <Typography>Functionality coming soon</Typography>
                                                    </TabPanel>
                                                </TabContext>
                                            </>
                                        ) : (
                                            <PuffLoader color="#00ffea" />
                                        )
                                    }
                                </>
                            )
                        ) : (
                            <Typography variant="body1">You haven't select your target SOAR platform yet. Please select your target SOAR platform in settings.</Typography>
                        )
                    }
                </Box>
            </Box>
        </>
    )
}