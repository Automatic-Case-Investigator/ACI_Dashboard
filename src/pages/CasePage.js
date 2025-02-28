import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, Divider, IconButton, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { useNavigate, useParams } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MarkdownPreview from '@uiw/react-markdown-preview';
import RefreshIcon from '@mui/icons-material/Refresh';
import PuffLoader from "react-spinners/PuffLoader";
import { TaskList } from "../components/task_list/TaskList";
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

    // automatic investigation states
    const [enableActivityGeneration, setEnableActivityGeneration] = useState(true);
    const [enableSIEMInvestigation, setEnableSIEMInvestigation] = useState(true);

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
            process.env.REACT_APP_BACKEND_URL + `ai_backend/task_generation_model/generate/`,
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

    const investigateTask = async () => {
        const requestBody = new FormData();
        requestBody.append("soar_id", targetSOAR.id);
        requestBody.append("org_id", orgId);
        requestBody.append("case_id", caseId);
        requestBody.append("generate_activities", enableActivityGeneration ? 1 : 0);
        requestBody.append("investigate_siem", enableSIEMInvestigation ? 1 : 0);

        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `ai_backend/automatic_investigation/investigate/`,
            {
                method: "POST",
                body: requestBody
            }
        );
        const rawData = await response.json();
        if (rawData.message && rawData.message === "Success") {
            setSnackbarMessage("Successfully created case investigation job. Check jobs page for details.");
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
    const debouncedInvestigateTask = debounce(investigateTask, 300);

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
                                                    <Typography variant="body1" sx={{ display: "inline-block" }}>{caseData.title}</Typography>
                                                    <Tooltip title="Refresh">
                                                        <IconButton sx={{ float: "right" }} onClick={refresh}>
                                                            <RefreshIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                                <TabContext value={currentTab}>
                                                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                                        <TabList indicatorColor="secondary" onChange={(_, newValue) => { setCurrentTab(newValue) }} aria-label="lab API tabs example">
                                                            <Tab label="General" value={0} disableRipple />
                                                            <Tab label="Tasks" value={1} disableRipple />
                                                            <Tab label="Automatic Investigation" value={2} disableRipple />
                                                        </TabList>
                                                    </Box>
                                                    <TabPanel value={0}><MarkdownPreview source={caseData.description} style={{ width: "calc(100vw - 150px)", background: "transparent", color: darkTheme.palette.primary.main }} /></TabPanel>
                                                    <TabPanel value={1}>
                                                        <Button size="small" color="secondary" variant="outlined" onClick={debouncedGenerateTask}>Generate Tasks</Button>
                                                        <TaskList taskList={taskList} soarId={targetSOAR.id} orgId={orgId} caseId={caseId} onRefresh={refresh} />
                                                    </TabPanel>
                                                    <TabPanel value={2}>
                                                        <Typography variant="h6">Options</Typography>
                                                        <Accordion>
                                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                                <Typography component="span">Activity Generation</Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                <Typography color="weak" sx={{ fontStyle: "italic" }}>
                                                                    This is responsible for generating detailed activities to be performed by analysts based on each tasks
                                                                    present in the case.
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ display: "inline-block", width: "30vw" }}>Enable</Typography>
                                                                <Checkbox sx={{ paddingLeft: 0 }} color="secondary" checked={enableActivityGeneration} onChange={() => setEnableActivityGeneration(!enableActivityGeneration)}/>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                        <Accordion>
                                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                                <Typography component="span">SIEM investigation</Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                <Typography color="weak" sx={{ fontStyle: "italic" }}>
                                                                    (Not yet implemented) This is responsible for automatically querying the SIEM and correlating security events to perform
                                                                    investigation. This must be used with activities existing in the case. This can be achieved by either
                                                                    enabling the activity generation or manually writing down investigation activities.
                                                                </Typography>
                                                                <Typography variant="body1" sx={{ display: "inline-block", width: "30vw" }}>Enable</Typography>
                                                                <Checkbox sx={{ paddingLeft: 0 }} color="secondary" checked={enableSIEMInvestigation} onChange={() => setEnableSIEMInvestigation(!enableSIEMInvestigation)}/>
                                                                <br />
                                                                <Typography variant="body1" sx={{ display: "inline-block", width: "30vw" }}>Search depth</Typography>
                                                                <TextField size="small" type="number" />
                                                            </AccordionDetails>
                                                        </Accordion>
                                                        <Button sx={{ marginTop: 1 }} size="small" color="secondary" variant="outlined" onClick={debouncedInvestigateTask}>Investigate</Button>
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