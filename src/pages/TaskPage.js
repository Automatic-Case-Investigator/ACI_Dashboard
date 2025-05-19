import { Box, Divider, IconButton, Paper, Typography } from "@mui/material";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useNavigate, useParams } from "react-router-dom";
import PuffLoader from "react-spinners/PuffLoader"
import { darkTheme } from "../themes/darkTheme";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Helmet } from "react-helmet";

import "../css/markdown.css";

export const TaskPage = () => {
    const { orgId, caseId, taskId } = useParams();

    const [cookies, setCookies, removeCookies] = useCookies(["token"]);
    const [errorMessage, setErrorMessage] = useState("");
    const [taskData, setTaskData] = useState(null);
    const [taskLogs, setTaskLogs] = useState([]);
    const [targetSOAR, setTargetSOAR] = useState(() => {
        const saved = localStorage.getItem("targetSOAR");
        const initialValue = JSON.parse(saved);
        return initialValue || null;
    });

    const navigate = useNavigate();

    const getTaskData = async () => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `soar/task/?soar_id=${targetSOAR.id}&org_id=${orgId}&task_id=${taskId}`,
            {
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                }
            }
        );
        const rawData = await response.json();

        if (rawData.code && rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        if (rawData["error"]) {
            setErrorMessage(rawData["error"])
        } else {
            setErrorMessage("")
            setTaskData(rawData)
        }
    }

    const getTaskLogs = async () => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `soar/task_log/?soar_id=${targetSOAR.id}&task_id=${taskId}`,
            {
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                }
            }
        );

        const rawData = await response.json();

        if (rawData.code && rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        if (rawData["error"]) {
            setErrorMessage(rawData["error"])
        } else {
            setErrorMessage("")
            console.log(rawData["task_logs"])
            setTaskLogs(rawData["task_logs"])
        }
    }

    useEffect(() => {
        if (!targetSOAR) {
            return;
        }

        getTaskData();
        getTaskLogs();
    }, [targetSOAR]);

    return (
        <>
            {
                taskData && (
                    <Helmet>
                        <title>{taskData.title}</title>
                    </Helmet>
                )
            }
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar
                    names={[
                        "Organizations",
                        `${orgId}`,
                        "cases",
                        `${caseId}`,
                        "tasks",
                        `${taskId}`
                    ]}
                    routes={[
                        "/organizations",
                        `/organizations/${orgId}/cases`,
                        `/organizations/${orgId}/cases`,
                        `/organizations/${orgId}/cases/${caseId}`,
                        `/organizations/${orgId}/cases/${caseId}`,
                        `/organizations/${orgId}/cases/${caseId}/tasks/${taskId}`
                    ]} />
                <VerticalNavbar />
                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                    {
                        targetSOAR ? (
                            errorMessage.length > 0 ? (
                                <Typography variant="body1">{errorMessage}</Typography>
                            ) : (
                                <>
                                    {
                                        taskData ? (
                                            <>
                                                <IconButton
                                                    size="small"
                                                    edge="start"
                                                    onClick={() => navigate(-1)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    <ArrowBackIosIcon fontSize="small" />
                                                </IconButton>
                                                <Typography sx={{ display: "inline-block", verticalAlign: "middle" }} variant="h6">{taskData.title}</Typography>
                                                <br />
                                                <Box sx={{ flexDirection: 'row' }}>
                                                    <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>ID:</b></Typography>
                                                    <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{taskData.id}</Typography>
                                                    <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>Created At:</b></Typography>
                                                    <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{new Date(taskData.createdAt).toString()}</Typography>
                                                    <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>Created By:</b></Typography>
                                                    <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{taskData.createdBy}</Typography>
                                                    <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>Group:</b></Typography>
                                                    <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{taskData.group}</Typography>
                                                    <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>Status:</b></Typography>
                                                    <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{taskData.status}</Typography>
                                                    <Divider sx={{ paddingTop: 1, marginBottom: 2 }} />

                                                    <Typography variant="h6">Description:</Typography>
                                                    <MarkdownPreview source={taskData.description} style={{ width: "calc(100vw - 150px)", background: "transparent", color: darkTheme.palette.primary.main, fontSize: "1rem" }} />
                                                    <Divider sx={{ paddingTop: 1, marginBottom: 2 }} />

                                                    <Typography variant="h6">Task Log:</Typography>
                                                    <Box sx={{ maxHeight: 500, overflow: "scroll" }}>
                                                        {
                                                            taskLogs && taskLogs.length > 0 ? (
                                                                taskLogs.map((log, index) => (
                                                                    <Paper key={index} sx={{ padding: 1, margin: 1 }}>
                                                                        <Typography sx={{ display: "inline-block", paddingRight: 2 }}>{log.createdBy}</Typography>
                                                                        <Typography sx={{ display: "inline-block", paddingRight: 2, color: "weak.main" }}>{new Date(taskData.createdAt).toString()}</Typography>
                                                                        <MarkdownPreview source={log.message} style={{ width: "calc(100vw - 150px)", background: "transparent", color: darkTheme.palette.primary.main, fontSize: "1rem" }} />
                                                                    </Paper>
                                                                ))
                                                            ) : (
                                                                <Typography sx={{ color: "weak.main" }}>No task logs have been found</Typography>
                                                            )
                                                        }
                                                    </Box>
                                                    <Divider sx={{ paddingTop: 1, marginBottom: 2 }} />
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
    )
}