import { CaseData, ObservableData, TargetSIEMInfo, TargetSOARInfo, TaskData, DocumentData } from "../types/types";
import { CaseAutomationsTab, WebSearchEnableState } from "../components/case_page/automations/Automations";
import { SIEMQueryAgent } from "../components/case_page/siem_query_agent/SIEMQueryAgent";
import { ObservableList } from "../components/case_page/observable_list/ObservableList";
import { DocumentList } from "../components/case_page/document_list/DocumentList";
import { Box, IconButton, Snackbar, Tooltip, Typography } from "@mui/material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
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
    const [documentList, setDocumentList] = useState<DocumentData[]>([]);
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
    const automationSettingsKey = 'caseAutomationSettings';
    // Helper function to load automation settings from localStorage
    const loadAutomationSettings = () => {
        try {
            const saved = localStorage.getItem(automationSettingsKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch {
            // If parsing fails, fall back to defaults
        }
        return null;
    };
    const savedSettings = loadAutomationSettings();
    // web search states
    const [enableWebSearch, setEnableWebSearch] = useState<WebSearchEnableState>(
        savedSettings?.enableWebSearch ?? {
            task_generation: false,
            activity_generation: false,
            siem_investigation: false
        }
    )
    // earliest time to look up setting
    const [earliestMagnitude, setEarliestMagnitude] = useState<number | "">(savedSettings?.earliestMagnitude ?? 1);
    const [earliestUnit, setEarliestUnit] = useState<string>(savedSettings?.earliestUnit ?? "years");
    // time window for events in vicinity
    const [vicinityMagnitude, setVicinityMagnitude] = useState<number | "">(savedSettings?.vicinityMagnitude ?? 1);
    const [vicinityUnit, setVicinityUnit] = useState<string>(savedSettings?.vicinityUnit ?? "hours");
    const [maxIterations, setMaxIterations] = useState<number | "">(savedSettings?.maxIterations ?? 3);
    const [additionalNotes, setAdditionalNotes] = useState<string>(savedSettings?.additionalNotes ?? "");
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
    const getDocumentList = async () => {
        const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}soar/document/?soar_id=${targetSOAR?.id}&org_id=${orgId}&case_id=${caseId}`,
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
            setDocumentList(rawData.pages);
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
    const generateActivity = async () => {
        const requestBody = new FormData();
        requestBody.append("soar_id", targetSOAR?.id || "");
        requestBody.append("case_id", caseId);
        requestBody.append("org_id", orgId);
        requestBody.append("web_search", enableWebSearch.task_generation ? "1" : "0");
        const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}ai_backend/activity_generation_model/generate/`,
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
    }
    const investigateTask = async () => {
        const correctedMagnitude = correctEarliestMagnitude();
        const correctedVicinityMagnitude = correctVicinityMagnitude();
        const correctedMaxIterations = correctMaxIterations();
        const requestBody = new FormData();
        requestBody.append("siem_id", targetSIEM?.id || "");
        requestBody.append("soar_id", targetSOAR?.id || "");
        requestBody.append("org_id", orgId);
        requestBody.append("case_id", caseId);
        requestBody.append("earliest_magnitude", correctedMagnitude.toString());
        requestBody.append("earliest_unit", earliestUnit);
        requestBody.append("vicinity_magnitude", correctedVicinityMagnitude.toString());
        requestBody.append("vicinity_unit", vicinityUnit);
        requestBody.append("max_iterations", correctedMaxIterations.toString());
        requestBody.append("additional_notes", additionalNotes);
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
    const correctEarliestMagnitude = () => {
        if (earliestMagnitude === "" || earliestMagnitude <= 0) {
            setEarliestMagnitude(1);
            return 1;
        }
        return earliestMagnitude;
    }
    const correctMaxIterations = () => {
        if (maxIterations === "" || maxIterations <= 0) {
            setMaxIterations(1);
            return 1
        }
        return maxIterations;
    }
    const correctVicinityMagnitude = () => {
        if (vicinityMagnitude === "" || vicinityMagnitude <= 0) {
            setVicinityMagnitude(1);
            return 1;
        }
        return vicinityMagnitude;
    }
    const updateData = () => {
        getCaseData();
        getObservables();
        getTaskList();
        getDocumentList();
    };
    const refresh = async () => {
        setLoading(true);
        await updateData();
        setLoading(false);
    };
    const debouncedGenerateTask = debounce(generateTask, 300);
    const debouncedGenerateActivity = debounce(generateActivity, 300);
    const debouncedInvestigateTask = debounce(investigateTask, 300);
    // Save automation settings to localStorage whenever any of them change
    useEffect(() => {
        const automationSettings = {
            enableWebSearch,
            earliestMagnitude,
            earliestUnit,
            vicinityMagnitude,
            vicinityUnit,
            maxIterations,
            additionalNotes
        };
        localStorage.setItem(automationSettingsKey, JSON.stringify(automationSettings));
    }, [enableWebSearch, earliestMagnitude, earliestUnit, vicinityMagnitude, vicinityUnit, maxIterations, additionalNotes]);
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
                                                            <Tab label="Documents" value="3" disableRipple />
                                                            <Tab label="Automations" value="4" disableRipple />
                                                        </TabList>
                                                    </Box>
                                                    <TabPanel value="0">
                                                        <MarkdownPreview
                                                            source={caseData.description}
                                                            style={{
                                                                width: "calc(100vw - 150px)",
                                                                background: "transparent",
                                                                color: darkTheme.palette.primary.main
                                                            }}
                                                            components={{
                                                                a: ({ children, className, ...props }) =>
                                                                    className && className.includes('anchor') ?
                                                                        <a style={{ display: "none" }}>{children}</a> :
                                                                        <a className={className} {...props}>{children}</a>
                                                            }}
                                                        />
                                                    </TabPanel>
                                                    <TabPanel value="1">
                                                        <ObservableList observableList={observables} soarId={targetSOAR.id} orgId={orgId} caseId={caseId} onRefresh={refresh} />
                                                    </TabPanel>
                                                    <TabPanel value="2">
                                                        <TaskList taskList={taskList} soarId={targetSOAR.id} orgId={orgId} caseId={caseId} onRefresh={refresh} />
                                                    </TabPanel>
                                                    <TabPanel value="3">
                                                        <DocumentList documentList={documentList} soarId={targetSOAR.id} orgId={orgId} caseId={caseId} onRefresh={refresh} />
                                                    </TabPanel>
                                                    <CaseAutomationsTab
                                                        enableWebSearch={enableWebSearch}
                                                        setEnableWebSearch={setEnableWebSearch}
                                                        earliestMagnitude={earliestMagnitude}
                                                        setEarliestMagnitude={setEarliestMagnitude}
                                                        earliestUnit={earliestUnit}
                                                        setEarliestUnit={setEarliestUnit}
                                                        vicinityMagnitude={vicinityMagnitude}
                                                        setVicinityMagnitude={setVicinityMagnitude}
                                                        vicinityUnit={vicinityUnit}
                                                        setVicinityUnit={setVicinityUnit}
                                                        maxIterations={maxIterations}
                                                        setMaxIterations={setMaxIterations}
                                                        additionalNotes={additionalNotes}
                                                        setAdditionalNotes={setAdditionalNotes}
                                                        correctEarliestMagnitude={correctEarliestMagnitude}
                                                        correctVicinityMagnitude={correctVicinityMagnitude}
                                                        correctMaxIterations={correctMaxIterations}
                                                        onGenerateTask={debouncedGenerateTask}
                                                        onGenerateActivity={debouncedGenerateActivity}
                                                        onInvestigateTask={debouncedInvestigateTask}
                                                    />
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
