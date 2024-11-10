import { Helmet } from "react-helmet";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, Button, Chip, Divider, IconButton, Snackbar, Tooltip, Typography } from "@mui/material";
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useNavigate, useParams } from "react-router-dom";
import PuffLoader from "react-spinners/PuffLoader"
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useEffect, useState } from "react";
import RefreshIcon from '@mui/icons-material/Refresh';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Alert from '@mui/material/Alert';
import { darkTheme } from "../themes/darkTheme";
import "../css/markdown.css"
import { debounce } from 'lodash';



export const CasePage = () => {
    const { orgId, caseId } = useParams();
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState("");
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSuccessful, setSnackbarSuccessful] = useState(true);
    const [caseData, setCaseData] = useState();
    const [taskData, setTaskData] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [targetSOAR, setTargetSOAR] = useState(() => {
        const saved = localStorage.getItem("targetSOAR");
        const initialValue = JSON.parse(saved);
        return initialValue || null;
    });

    // component open states
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const getCaseData = async () => {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/get_case/?soar_id=${targetSOAR.id}&case_id=${caseId}`);
        const rawData = await response.json();

        if (rawData["error"]) {
            setErrorMessage(rawData["error"])
        } else {
            setErrorMessage("")
            setCaseData(rawData)
        }
    }

    const getTaskData = async () => {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/get_tasks/?soar_id=${targetSOAR.id}&org_id=${orgId}&case_id=${caseId}`);
        const rawData = await response.json();

        if (rawData["error"]) {
            setErrorMessage(rawData["error"])
        } else {
            setErrorMessage("")
            setTaskData(rawData["tasks"])
        }
    }

    const generateTask = async () => {
        const requestBody = new FormData();
        requestBody.append("soar_id", targetSOAR.id);
        requestBody.append("case_id", caseId);

        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `soar/generate_tasks/`,
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

    const refresh = () => {
        getCaseData();
        getTaskData();
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
            <Helmet>
                <title>CasePage</title>
            </Helmet>
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
                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                    {
                        targetSOAR ? (
                            errorMessage.length > 0 ? (
                                <Typography variant="body1">{errorMessage}</Typography>
                            ) : (
                                <>
                                    {
                                        caseData ? (
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
                                                            <Tab label="General" value={0} />
                                                            <Tab label="Tasks Generation" value={1} />
                                                            <Tab label="Automatic Investigation" value={2} />
                                                        </TabList>
                                                    </Box>
                                                    <TabPanel value={0}><MarkdownPreview source={caseData.description} style={{ width: "calc(100vw - 150px)", background: "transparent", color: darkTheme.palette.primary.main }} /></TabPanel>
                                                    <TabPanel value={1}>
                                                        <Typography sx={{ paddingBottom: 1 }}>The task generation AI is trained specifically to analyze security cases and generate meaningful tasks suited for SOC analysis.</Typography>
                                                        <Button color="secondary" variant="outlined" onClick={debouncedGenerateTask}>Generate Tasks</Button>
                                                        <br />
                                                        <br />
                                                        <Divider />
                                                        {
                                                            taskData.length === 0 ? (
                                                                <Typography>No tasks were found</Typography>
                                                            ) : (
                                                                <>
                                                                    <Typography>Tasks:</Typography>
                                                                    {
                                                                        taskData.map((task, index) => (
                                                                            <Accordion key={index}>
                                                                                <AccordionSummary
                                                                                    expandIcon={<ExpandMoreIcon />}
                                                                                    aria-controls="panel1-content"
                                                                                    id="panel1-header"
                                                                                >
                                                                                    {task.title}
                                                                                    {
                                                                                        task.group === "Automatic Case Investigator" && (
                                                                                            <Chip label="Generated" color="success" sx={{ marginLeft: 1 }} />
                                                                                        )
                                                                                    }
                                                                                </AccordionSummary>
                                                                                <AccordionDetails>
                                                                                    {task.description}
                                                                                </AccordionDetails>
                                                                            </Accordion>
                                                                        ))
                                                                    }
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