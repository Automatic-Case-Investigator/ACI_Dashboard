import React, { useEffect, useState } from "react";
import { CallbackFunction, TargetSOARInfo, TaskData, TaskLogData } from "../../../types/types";
import { Box, Button, Divider, Drawer, Paper, Typography, Collapse, IconButton } from "@mui/material";
import MarkdownPreview from '@uiw/react-markdown-preview';

import { useCookies } from "react-cookie";
import { darkTheme } from "../../../themes/darkTheme";
import PuffLoader from "react-spinners/PuffLoader";
import { useNavigate } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface TaskPreviewProps {
    open: boolean;
    onClose: CallbackFunction;
    orgId: string;
    caseId: string;
    taskId: string;
}

export const TaskPreview: React.FC<TaskPreviewProps> = ({ open, onClose, orgId, caseId, taskId }) => {
    const [cookies, _setCookies, removeCookies] = useCookies(["token"]);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>("");
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

    const navigate = useNavigate();

    const [openLogIndexes, setOpenLogIndexes] = useState<number[]>([]);

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

    const update = async () => {
        await Promise.all([getTaskData(), getTaskLogs()]);
    };

    useEffect(() => {
        if (!targetSOAR || !open) return;

        const fetchData = async () => {
            await update();
            setLoading(false);
        };

        setLoading(true);
        fetchData();
    }, [targetSOAR, open]);

    useEffect(() => {
        setOpenLogIndexes(taskLogs.map((_, i) => i));
    }, [taskLogs]);


    return <>
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: "50vw", height: "100%", overflow: "scroll", p: 2 }}>
                <Typography variant="h6">{(!loading && taskData) ? taskData.title : ""}</Typography>
                {targetSOAR ? (
                    errorMessage.length > 0 ? (
                        <Typography variant="body1">{errorMessage}</Typography>
                    ) : (
                        <>
                            {!loading && taskData ? (
                                <>
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
                                        <MarkdownPreview source={taskData.description} style={{ width: "calc(50vw - 150px)", background: "transparent", color: darkTheme.palette.primary.main, fontSize: "1rem" }} />
                                        <Divider sx={{ paddingTop: 1, marginBottom: 1 }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ mt: 2 }}>Task Log:</Typography>
                                    <Box sx={{ flex: 1, overflow: "auto" }}>
                                        {taskLogs && taskLogs.length > 0 ? (
                                            taskLogs.map((log, index) => {
                                                const isOpen = openLogIndexes.includes(index);
                                                return (
                                                    <Paper key={index} sx={{ padding: 1, margin: 1, overflowX: 'scroll' }}>
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
                                                        </Box>
                                                        <Collapse in={isOpen}>
                                                            <MarkdownPreview source={log.message} style={{ width: "calc(50vw - 150px)", background: "transparent", color: darkTheme.palette.primary.main, fontSize: "1rem" }} />
                                                        </Collapse>
                                                    </Paper>
                                                )
                                            })
                                        ) : (
                                            <Typography sx={{ color: "weak.main" }}>No task logs have been found</Typography>
                                        )}
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
            <Drawer variant="permanent" anchor="bottom" sx={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "50vw",          // match the parent drawer width
                '& .MuiDrawer-paper': { // style the paper element
                    width: '50vw',
                    position: 'fixed',
                    bottom: 0
                }
            }}>
                {
                    !loading && (
                        <Box sx={{ p: 1, backdropFilter: "blur(20px)" }}>
                            <Button onClick={() =>
                                navigate(
                                    `/organizations/${orgId}/cases/${caseId}/tasks/${taskId}`
                                )
                            }>View Details</Button>
                        </Box>
                    )
                }
            </Drawer>
        </Drawer>
    </>
}