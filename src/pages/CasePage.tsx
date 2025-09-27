import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, FormControlLabel, IconButton, Snackbar, Tooltip, Typography } from "@mui/material";
import { CaseData, ObservableData, TargetSIEMInfo, TargetSOARInfo, TaskData } from "../types/types";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MarkdownPreview from '@uiw/react-markdown-preview';
import RefreshIcon from '@mui/icons-material/Refresh';
import PuffLoader from "react-spinners/PuffLoader";
import { TaskList } from "../components/case_page/task_list/TaskList";
import { darkTheme } from "../themes/darkTheme";
import TabContext from '@mui/lab/TabContext';
import { useEffect, useState } from "react";
import TabPanel from '@mui/lab/TabPanel';
import Alert from '@mui/material/Alert';
import TabList from '@mui/lab/TabList';
import { Helmet } from "react-helmet";
import Tab from '@mui/material/Tab';
import { debounce } from 'lodash';
import { useCookies } from "react-cookie";

import "../css/markdown.css"
import { SIEMQueryAgent } from "../components/case_page/siem_query_agent/SIEMQueryAgent";
import { ObservableList } from "../components/case_page/observable_list/ObservableList";

interface WebSearchEnableState {
    task_generation: boolean,
    activity_generation: boolean,
    siem_investigation: boolean
}

export const CasePage = () => {
    const { orgId = "", caseId = "" } = useParams<{ orgId: string; caseId: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const [cookies, , removeCookies] = useCookies(["token"]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");
    const [snackbarSuccessful, setSnackbarSuccessful] = useState<boolean>(true);
    const [caseData, setCaseData] = useState<CaseData | null>(null);
    const [taskList, setTaskList] = useState<TaskData[]>([]);
    const [observables, setObservables] = useState<ObservableData[]>([]);
    const currentTab = searchParams.get('tab') || "0";

    const [targetSOAR, _setTargetSOAR] = useState<TargetSOARInfo | null>(() => {
        try {
            const saved = localStorage.getItem("targetSOAR");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [targetSIEM, _setTargetSIEM] = useState<TargetSIEMInfo | null>(() => {
        try {
            const saved = localStorage.getItem("targetSIEM");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const navigate = useNavigate();

    // automatic investigation states
    const [enableWebSearch, setEnableWebSearch] = useState<WebSearchEnableState>({
        task_generation: false,
        activity_generation: false,
        siem_investigation: false
    })

    // component open states
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

    const getCaseData = async () => {
        const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}soar/case/?soar_id=${targetSOAR?.id}&case_id=${caseId}`,
            {
                headers: {
                    Authorization: `Bearer ${cookies.token}`,
                },
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
            setCaseData(rawData);
        }
    };

    const getTaskList = async () => {
        const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}soar/task/?soar_id=${targetSOAR?.id}&org_id=${orgId}&case_id=${caseId}`,
            {
                headers: {
                    Authorization: `Bearer ${cookies.token}`,
                },
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
            setTaskList(rawData.tasks);
        }
    };

    const getObservables = async () => {
        const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}soar/observables/?soar_id=${targetSOAR?.id}&org_id=${orgId}&case_id=${caseId}`,
            {
                headers: {
                    Authorization: `Bearer ${cookies.token}`,
                },
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
            setObservables(rawData.observables);
        }
    };

    const generateTask = async () => {
        const requestBody = new FormData();
        requestBody.append("soar_id", targetSOAR?.id || "");
        requestBody.append("case_id", caseId);
        requestBody.append("web_search", enableWebSearch.task_generation ? "1" : "0");

        const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}ai_backend/task_generation_model/generate/`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${cookies.token}`,
                },
                body: requestBody,
            }
        );

        const rawData = await response.json();

        if (rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        if (rawData.message === "Success") {
            setSnackbarMessage("Successfully created task generation job. Check jobs page for details.");
            setSnackbarSuccessful(true);
        } else {
            setSnackbarMessage(rawData.error || "Failed communicating with the backend. Contact administrators.");
            setSnackbarSuccessful(false);
        }
        setSnackbarOpen(true);
    };

    const investigateTask = async (enableActivityGeneration: boolean, enableSIEMInvestigation: boolean) => {
        const requestBody = new FormData();
        requestBody.append("siem_id", targetSIEM?.id || "");
        requestBody.append("soar_id", targetSOAR?.id || "");
        requestBody.append("org_id", orgId);
        requestBody.append("case_id", caseId);
        requestBody.append("generate_activities", enableActivityGeneration ? "1" : "0");
        requestBody.append("investigate_siem", enableSIEMInvestigation ? "1" : "0");
        requestBody.append("generate_activities_web_search", enableWebSearch.activity_generation ? "1" : "0");
        requestBody.append("investigate_siem_web_search", enableWebSearch.siem_investigation ? "1" : "0");

        const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}ai_backend/automatic_investigation/investigate/`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${cookies.token}`,
                },
                body: requestBody,
            }
        );

        const rawData = await response.json();

        if (rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        if (rawData.message === "Success") {
            setSnackbarMessage("Successfully created case investigation job. Check jobs page for details.");
            setSnackbarSuccessful(true);
        } else {
            setSnackbarMessage(rawData.error || "Failed communicating with the backend. Contact administrators.");
            setSnackbarSuccessful(false);
        }
        setSnackbarOpen(true);
    };

    const updateData = () => {
        getCaseData();
        getObservables();
        getTaskList();
    };

    const refresh = async () => {
        setLoading(true);
        await updateData();
        setLoading(false);
    };

    const debouncedGenerateTask = debounce(generateTask, 300);
    const debouncedInvestigateTask = debounce(investigateTask, 300);

    useEffect(() => {
        if (!targetSOAR) return;
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
                                                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                                                    <IconButton
                                                        size="small"
                                                        edge="start"
                                                        onClick={() => navigate(`/organizations/${orgId}/cases`, { replace: true })}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        <ArrowBackIosIcon fontSize="small" />
                                                    </IconButton>
                                                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                                                        {caseData.title}
                                                    </Typography>

                                                    <Tooltip title="Refresh">
                                                        <IconButton onClick={refresh}>
                                                            <RefreshIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>

                                                <TabContext value={currentTab}>
                                                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                                        <TabList indicatorColor="secondary" onChange={(_, value) => {
                                                            setSearchParams({ tab: value });
                                                        }}>

                                                            <Tab label="General" value="0" disableRipple />
                                                            <Tab label="Observables" value="1" disableRipple />
                                                            <Tab label="Tasks" value="2" disableRipple />
                                                            <Tab label="Automations" value="3" disableRipple />

                                                        </TabList>
                                                    </Box>
                                                    <TabPanel value="0"><MarkdownPreview source={caseData.description} style={{ width: "calc(100vw - 150px)", background: "transparent", color: darkTheme.palette.primary.main }} /></TabPanel>
                                                    <TabPanel value="1">
                                                        <ObservableList observableList={observables} soarId={targetSOAR.id} orgId={orgId} caseId={caseId} onRefresh={refresh} />
                                                    </TabPanel>
                                                    <TabPanel value="2">
                                                        <TaskList taskList={taskList} soarId={targetSOAR.id} orgId={orgId} caseId={caseId} onRefresh={refresh} />
                                                    </TabPanel>
                                                    <TabPanel value="3">
                                                        {/* Task Generation */}
                                                        <Accordion defaultExpanded>
                                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                                <Typography component="span">Task Generation</Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                                                                    This is responsible for generating high-level investigation objectives for understanding the cause of the security case and correlating relevant events.
                                                                </Typography>
                                                                <Box sx={{ display: "flex", flexDirection: "column", mt: 1, ml: 1, mb: 2 }}>
                                                                    <FormControlLabel
                                                                        label="Enable Web Search"
                                                                        control={
                                                                            <Checkbox
                                                                                color="secondary"
                                                                                checked={enableWebSearch.task_generation}
                                                                                onChange={() => setEnableWebSearch({ ...enableWebSearch, task_generation: !enableWebSearch.task_generation })}
                                                                            />
                                                                        }
                                                                    />
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Allows the system to perform smart internet searches and gather up-to-date knowledge as context. This increases the amount of time required as it performs smart searches and text summarization.
                                                                    </Typography>
                                                                </Box>
                                                                <Button size="small" variant="outlined" color="secondary" onClick={debouncedGenerateTask}>Run</Button>
                                                            </AccordionDetails>
                                                        </Accordion>

                                                        <Accordion defaultExpanded>
                                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                                <Typography component="span">Task Investigation</Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                {/* Activity Generation */}
                                                                <Accordion defaultExpanded>
                                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                                        <Typography component="span">Activity Generation</Typography>
                                                                    </AccordionSummary>
                                                                    <AccordionDetails>
                                                                        <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                                                                            This is responsible for generating detailed activities to be performed by analysts based on each task present in the case.
                                                                        </Typography>
                                                                        <Box sx={{ display: "flex", flexDirection: "column", mt: 1, ml: 1, mb: 2 }}>
                                                                            <FormControlLabel
                                                                                label="Enable Web Search"
                                                                                control={
                                                                                    <Checkbox
                                                                                        color="secondary"
                                                                                        checked={enableWebSearch.activity_generation}
                                                                                        onChange={() => setEnableWebSearch({ ...enableWebSearch, activity_generation: !enableWebSearch.activity_generation })}
                                                                                    />
                                                                                }
                                                                            />
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Allows the system to perform smart internet searches and gather up-to-date knowledge as context. This increases the amount of time required as it performs smart searches and text summarization.
                                                                            </Typography>
                                                                        </Box>
                                                                        <Button size="small" variant="outlined" color="secondary" onClick={() => { debouncedInvestigateTask(true, false) }}>Run</Button>
                                                                    </AccordionDetails>
                                                                </Accordion>

                                                                {/* SIEM Investigation */}
                                                                <Accordion defaultExpanded>
                                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                                        <Typography component="span">SIEM Investigation</Typography>
                                                                    </AccordionSummary>
                                                                    <AccordionDetails>
                                                                        <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                                                                            This is responsible for automatically querying the SIEM and correlating security events to perform investigation. This must be used with activities existing in the case. This can be achieved by either enabling the activity generation or manually writing down investigation activities.
                                                                        </Typography>
                                                                        <Box sx={{ display: "flex", flexDirection: "column", mt: 1, ml: 1, mb: 2 }}>
                                                                            <FormControlLabel
                                                                                label="Enable Web Search"
                                                                                control={
                                                                                    <Checkbox
                                                                                        color="secondary"
                                                                                        checked={enableWebSearch.siem_investigation}
                                                                                        onChange={() => setEnableWebSearch({ ...enableWebSearch, siem_investigation: !enableWebSearch.siem_investigation })}
                                                                                    />
                                                                                }
                                                                            />
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Allows the system to perform smart internet searches and gather up-to-date knowledge as context. This increases the amount of time required as it performs smart searches and text summarization.
                                                                            </Typography>
                                                                        </Box>
                                                                        <Button size="small" variant="outlined" color="secondary" onClick={() => { debouncedInvestigateTask(false, true) }}>Run</Button>
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                                <Button sx={{ marginTop: 1 }} size="small" color="secondary" variant="outlined" onClick={() => { debouncedInvestigateTask(true, true) }}>Run All</Button>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </TabPanel>
                                                </TabContext>
                                                <Box sx={{ position: "fixed", bottom: 12, right: 12 }}>
                                                    <SIEMQueryAgent />
                                                </Box>
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
    );
};
