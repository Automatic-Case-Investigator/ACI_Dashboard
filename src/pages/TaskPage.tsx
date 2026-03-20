import { Box, Divider, IconButton, Paper, TextField, Tooltip, Typography, Collapse } from "@mui/material";
import { SIEMQueryAgent } from "../components/case_page/siem_query_agent/SIEMQueryAgent";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useNavigate, useParams } from "react-router-dom";
import { TargetSOARInfo, TaskData, TaskLogData } from "../types/types";
import PuffLoader from "react-spinners/PuffLoader"
import DoneIcon from '@mui/icons-material/Done';
import { darkTheme } from "../themes/darkTheme";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Helmet } from "react-helmet";

import "../css/markdown.css";

export const TaskPage = () => {
    const { orgId, caseId, taskId } = useParams();

    const [cookies, _setCookies, removeCookies] = useCookies(["token"]);
    const [errorMessage, setErrorMessage] = useState("");
    const [taskData, setTaskData] = useState<TaskData | null>(null);
    const [taskLogs, setTaskLogs] = useState<Array<TaskLogData>>([]);
    const [targetSOAR, _setTargetSOAR] = useState<TargetSOARInfo | null>(() => {
        try {
            const saved = localStorage.getItem("targetSOAR");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    // State for editing task log
    const [editingLogIndex, setEditingLogIndex] = useState<number | null>(null);
    const [editingLogValue, setEditingLogValue] = useState<string>("");
    const [logSaving, setLogSaving] = useState<boolean>(false);

    // State for collapsible task logs (open indexes)
    const [openLogIndexes, setOpenLogIndexes] = useState<number[]>([]);

    // State of task log copy button
    const [copyButtonSuccess, setCopyButtonSuccess] = useState<boolean>(false);

    const navigate = useNavigate();

    const toggleLogOpen = (index: number) => {
        setOpenLogIndexes(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    }

    const getTaskData = async () => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `soar/task/?soar_id=${targetSOAR?.id}&org_id=${orgId}&task_id=${taskId}`,
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
            process.env.REACT_APP_BACKEND_URL + `soar/task_log/?soar_id=${targetSOAR?.id}&task_id=${taskId}`,
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
            setTaskLogs(rawData["task_logs"])
        }
    }

    const handleTaskLogSave = async (logId: string, logValue: string) => {
        setLogSaving(true);
        const requestBody = new FormData();
        requestBody.append("soar_id", targetSOAR?.id || "");
        requestBody.append("task_id", taskData?.id || "");
        requestBody.append("task_log_id", logId);
        requestBody.append("task_log_data", logValue);

        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `soar/task_log/`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cookies.token}`,
                    "Accept": "application/json"
                },
                body: requestBody
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
            setTaskLogs((prevLogs) =>
                prevLogs.map((log) => (log.id === logId ? { ...log, message: logValue } : log))
            );
        }
        setLogSaving(false);
    }

    useEffect(() => {
        if (!targetSOAR) {
            return;
        }

        getTaskData();
        getTaskLogs();
    }, [targetSOAR]);

    // open all logs by default when taskLogs update
    useEffect(() => {
        setOpenLogIndexes(taskLogs.map((_, i) => i));
    }, [taskLogs]);

    return (
        <>
            {taskData && (
                <Helmet>
                    <title>{taskData.title}</title>
                </Helmet>
            )}
            <Box sx={{ display: "flex", height: "100vh" }}>
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
                    ]}
                />
                <VerticalNavbar />
                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5, height: "100vh", minHeight: 0, overflow: "auto", display: 'flex', flexDirection: 'column' }}>
                    {targetSOAR ? (
                        errorMessage.length > 0 ? (
                            <Typography variant="body1">{errorMessage}</Typography>
                        ) : (
                            <>
                                {taskData ? (
                                    <>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <IconButton
                                                size="small"
                                                edge="start"
                                                onClick={() => navigate(-1)}
                                                sx={{ mr: 1 }}
                                            >
                                                <ArrowBackIosIcon fontSize="small" />
                                            </IconButton>
                                            <Typography variant="h6">{taskData.title}</Typography>
                                        </Box>
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
                                            <Divider sx={{ paddingTop: 1, marginBottom: 1 }} />

                                            <Typography variant="h6">Description:</Typography>
                                            <MarkdownPreview
                                                source={taskData.description}
                                                style={{
                                                    width: "calc(100vw - 150px)",
                                                    background: "transparent",
                                                    color: darkTheme.palette.primary.main,
                                                    fontSize: "1rem"
                                                }}
                                                components={{
                                                    a: ({ children, className, ...props }) =>
                                                        className && className.includes('anchor') ?
                                                            <a style={{ display: "none" }}>{children}</a> :
                                                            <a className={className} {...props}>{children}</a>
                                                }}
                                            />
                                            <Divider sx={{ paddingTop: 1, marginBottom: 1 }} />
                                        </Box>
                                        <Typography variant="h6" sx={{ mt: 2 }}>Task Log:</Typography>
                                        <Box sx={{ flex: 1, overflow: "auto" }}>
                                            {taskLogs && taskLogs.length > 0 ? (
                                                taskLogs.map((log, index) => {
                                                    const isOpen = openLogIndexes.includes(index);
                                                    return (
                                                        <Paper key={index} sx={{ padding: 1, margin: 1, overflowX: "scroll", width: "100%" }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                                                                    <IconButton
                                                                        onClick={() => toggleLogOpen(index)}
                                                                        aria-label={isOpen ? "Collapse" : "Expand"}
                                                                        size="small"
                                                                        sx={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                                                                    >
                                                                        <ExpandMoreIcon />
                                                                    </IconButton>
                                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                            <Typography sx={{ display: "inline-block" }}>{log.createdBy}</Typography>
                                                                            <Typography sx={{ display: "inline-block", color: "weak.main" }}>{new Date(taskData.createdAt).toString()}</Typography>
                                                                        </Box>
                                                                        {!isOpen && (
                                                                            <Typography
                                                                                sx={{
                                                                                    color: "weak.main",
                                                                                    fontSize: "0.875rem",
                                                                                    overflow: "hidden",
                                                                                    textOverflow: "ellipsis",
                                                                                    whiteSpace: "nowrap",
                                                                                    mt: 0.5
                                                                                }}
                                                                            >
                                                                                {log.message.split('\n')[0]}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                                    {editingLogIndex === index ? (
                                                                        <Box>
                                                                            <IconButton
                                                                                onClick={async () => {
                                                                                    await handleTaskLogSave(log.id, editingLogValue);
                                                                                    setEditingLogIndex(null);
                                                                                }}
                                                                                sx={{ mr: 1 }}
                                                                                loading={logSaving}
                                                                            >
                                                                                <Tooltip title="Save" placement="top">
                                                                                    <SaveIcon />
                                                                                </Tooltip>
                                                                            </IconButton>
                                                                            <IconButton
                                                                                onClick={() => {
                                                                                    setEditingLogIndex(null);
                                                                                    setEditingLogValue(log.message);
                                                                                }}
                                                                            >
                                                                                <Tooltip title="Cancel" placement="top">
                                                                                    <CloseIcon />
                                                                                </Tooltip>
                                                                            </IconButton>
                                                                        </Box>
                                                                    ) : (
                                                                        <Tooltip title="Edit" placement="top">
                                                                            <IconButton
                                                                                onClick={() => {
                                                                                    setEditingLogIndex(index);
                                                                                    setEditingLogValue(log.message);
                                                                                }}
                                                                            >
                                                                                <EditIcon />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}
                                                                    <Tooltip title={copyButtonSuccess ? "Copied!" : "Copy"} placement="top">
                                                                        <IconButton
                                                                            onClick={() => {
                                                                                navigator.clipboard.writeText(log.message);
                                                                                setCopyButtonSuccess(true);
                                                                                setTimeout(() => setCopyButtonSuccess(false), 2000);
                                                                            }}
                                                                        >
                                                                            {copyButtonSuccess ? <DoneIcon sx={{ color: "success.main" }} /> : <ContentCopyIcon />}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </Box>
                                                            <Collapse in={isOpen}>
                                                                {editingLogIndex === index ? (
                                                                    <TextField
                                                                        multiline
                                                                        fullWidth
                                                                        value={editingLogValue}
                                                                        onChange={e => setEditingLogValue(e.target.value)}
                                                                        minRows={3}
                                                                        sx={{
                                                                            background: "transparent",
                                                                            color: darkTheme.palette.primary.main,
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <MarkdownPreview
                                                                        source={log.message}
                                                                        style={{
                                                                            width: "calc(100vw - 150px)",
                                                                            background: "transparent",
                                                                            color: darkTheme.palette.primary.main,
                                                                            fontSize: "1rem"
                                                                        }}
                                                                        components={{
                                                                            a: ({ children, className, ...props }) =>
                                                                                className && className.includes('anchor') ?
                                                                                    <a style={{ display: "none" }}>{children}</a> :
                                                                                    <a className={className} {...props}>{children}</a>
                                                                        }}
                                                                    />
                                                                )}
                                                            </Collapse>
                                                        </Paper>
                                                    )
                                                })
                                            ) : (
                                                <Typography sx={{ color: "weak.main" }}>No task logs have been found</Typography>
                                            )}
                                        </Box>
                                        <Box sx={{ position: "fixed", bottom: 12, right: 12 }}>
                                            <SIEMQueryAgent />
                                        </Box>
                                        <Divider sx={{ paddingTop: 1, marginBottom: 2 }} />
                                    </>
                                ) : (
                                    <PuffLoader color="#00ffea" />
                                )}
                            </>
                        )
                    ) : (
                        <Typography variant="body1">You haven't select your target SOAR platform yet. Please select your target SOAR platform in settings.</Typography>
                    )}
                </Box>
            </Box>
        </>
    )
}