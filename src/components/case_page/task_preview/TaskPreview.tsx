import React, { useEffect, useState } from "react";
import { CallbackFunction, TargetSOARInfo, TaskData, TaskLogData } from "../../../types/types";
import { Box, Button, Divider, Drawer, Paper, Typography, Collapse, IconButton, Tooltip, Menu, MenuItem, TextField } from "@mui/material";
import MarkdownPreview from '@uiw/react-markdown-preview';

import { useCookies } from "react-cookie";
import { darkTheme } from "../../../themes/darkTheme";
import PuffLoader from "react-spinners/PuffLoader";
import { useNavigate } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import MoreVertIcon from '@mui/icons-material/MoreVert';

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
    
    const [editingLogIndex, setEditingLogIndex] = useState<number | null>(null);
    const [editingLogValue, setEditingLogValue] = useState<string>("");
    const [logSaving, setLogSaving] = useState<boolean>(false);
    const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState<{ [key: string]: HTMLButtonElement | null }>({});

    const toggleLogOpen = (index: number) => {
        setOpenLogIndexes(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    }

    const handleLogInvestigate = (logMessage: string) => {
        localStorage.setItem("taskLogForInvestigation", logMessage);
    };

    const handleTaskLogDelete = async (logId: string) => {
        const requestBody = new FormData();
        requestBody.append("soar_id", targetSOAR?.id || "");
        requestBody.append("task_id", taskData?.id || "");
        requestBody.append("task_log_id", logId);

        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `soar/task_log/`,
            {
                method: "DELETE",
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
            setTaskLogs((prevLogs) => prevLogs.filter((log) => log.id !== logId));
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

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, logId: string) => {
        setMenuAnchorEl(prev => ({ ...prev, [logId]: event.currentTarget }));
    };

    const handleMenuClose = (logId: string) => {
        setMenuAnchorEl(prev => ({ ...prev, [logId]: null }));
    };

    const handleCopyLog = (message: string, logId: string) => {
        navigator.clipboard.writeText(message);
        setCopySuccessId(logId);
        setTimeout(() => setCopySuccessId(null), 2000);
    };

    const handleInvestigateAndClose = (message: string, logId: string) => {
        handleLogInvestigate(message);
        handleMenuClose(logId);
    };

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
                                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                {editingLogIndex === index ? (
                                                                    // Edit mode: Show save/cancel with clear visual distinction
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        gap: 0.25,
                                                                        px: 0.75,
                                                                        py: 0.5,
                                                                        borderRadius: 1,
                                                                        bgcolor: 'action.selected',
                                                                        border: '1px solid',
                                                                        borderColor: 'primary.main',
                                                                    }}>
                                                                        <Tooltip title="Save changes" placement="top">
                                                                            <IconButton
                                                                                onClick={async () => {
                                                                                    await handleTaskLogSave(log.id, editingLogValue);
                                                                                    setEditingLogIndex(null);
                                                                                }}
                                                                                size="small"
                                                                                disabled={logSaving}
                                                                                sx={{ color: 'success.main' }}
                                                                            >
                                                                                <SaveIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Cancel editing" placement="top">
                                                                            <IconButton
                                                                                onClick={() => {
                                                                                    setEditingLogIndex(null);
                                                                                    setEditingLogValue(log.message);
                                                                                }}
                                                                                size="small"
                                                                                sx={{ color: 'error.main' }}
                                                                            >
                                                                                <CloseIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Box>
                                                                ) : (
                                                                    <>
                                                                        {/* Primary quick actions */}
                                                                        <Tooltip title="Edit this log" placement="top">
                                                                            <IconButton
                                                                                onClick={() => {
                                                                                    setEditingLogIndex(index);
                                                                                    setEditingLogValue(log.message);
                                                                                }}
                                                                                size="small"
                                                                                color="primary"
                                                                            >
                                                                                <EditIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title={copySuccessId === log.id ? "Copied!" : "Copy to clipboard"} placement="top">
                                                                            <IconButton
                                                                                onClick={() => handleCopyLog(log.message, log.id)}
                                                                                size="small"
                                                                                color={copySuccessId === log.id ? "success" : "default"}
                                                                            >
                                                                                {copySuccessId === log.id ? <DoneIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                                                                            </IconButton>
                                                                        </Tooltip>

                                                                        {/* Secondary actions menu */}
                                                                        <Tooltip title="More actions" placement="top">
                                                                            <IconButton
                                                                                onClick={(e) => handleMenuOpen(e, log.id)}
                                                                                size="small"
                                                                            >
                                                                                <MoreVertIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Menu
                                                                            anchorEl={menuAnchorEl[log.id] || null}
                                                                            open={Boolean(menuAnchorEl[log.id])}
                                                                            onClose={() => handleMenuClose(log.id)}
                                                                        >
                                                                            <MenuItem
                                                                                onClick={() => handleInvestigateAndClose(log.message, log.id)}
                                                                            >
                                                                                <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                                                                                Investigate
                                                                            </MenuItem>
                                                                            <MenuItem
                                                                                onClick={() => {
                                                                                    handleTaskLogDelete(log.id);
                                                                                    handleMenuClose(log.id);
                                                                                }}
                                                                                sx={{ color: 'error.main' }}
                                                                            >
                                                                                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                                                                                Delete
                                                                            </MenuItem>
                                                                        </Menu>
                                                                    </>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                        <Collapse in={isOpen}>
                                                            {editingLogIndex === index ? (
                                                                <Box sx={{ mt: 2 }}>
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
                                                                </Box>
                                                            ) : (
                                                                <MarkdownPreview source={log.message} style={{ width: "calc(50vw - 150px)", background: "transparent", color: darkTheme.palette.primary.main, fontSize: "1rem" }} />
                                                            )}
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