import { Helmet } from "react-helmet";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, Button, Divider, IconButton, Tooltip, Typography } from "@mui/material";
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



export const CasePage = () => {
    const { orgId, caseId } = useParams();
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState("");
    const [caseData, setCaseData] = useState();
    const [taskData, setTaskData] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [targetSOAR, setTargetSOAR] = useState(() => {
        const saved = localStorage.getItem("targetSOAR");
        const initialValue = JSON.parse(saved);
        return initialValue || null;
    });

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

    const refresh = () => {
        getCaseData();
        getTaskData();
    }

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
                <HorizontalNavbar title={`Organizations/${orgId}/cases/${caseId}`} />
                <VerticalNavbar />
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
                                                    <TabPanel value={0}><MarkdownPreview source={caseData.description} style={{ width: "calc(100vw - 150px)", background: "transparent" }} /></TabPanel>
                                                    <TabPanel value={1}>
                                                        <Button color="secondary" variant="outlined">Generate Tasks</Button>
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
                                                    <TabPanel value={2}>Functionality coming soon</TabPanel>
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