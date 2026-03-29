import { Box, Divider, Typography, Snackbar, Alert } from "@mui/material";
import { debounce } from 'lodash';
import { SIEMQueryAgent } from "../components/case_page/siem_query_agent/SIEMQueryAgent";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { useNavigate, useParams } from "react-router-dom";
import { TargetSOARInfo, TaskData, TaskLogData } from "../types/types";
import PuffLoader from "react-spinners/PuffLoader"
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Helmet } from "react-helmet";
import { TaskLogSection } from "../components/task_page/TaskLogSection";
import { TaskInvestigationDialog } from "../components/task_page/TaskInvestigationDialog";
import { TaskPageHeaderDetails } from "../components/task_page/TaskPageHeaderDetails";
import { deleteTaskLogApi, fetchTaskDataApi, fetchTaskLogsApi, saveTaskLogApi } from "../components/task_page/taskPageApi";
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
    const [targetSIEM, _setTargetSIEM] = useState<any | null>(() => {
        try {
            const saved = localStorage.getItem("targetSIEM");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");
    const [snackbarSuccessful, setSnackbarSuccessful] = useState<boolean>(true);
    // State for editing task log
    const [editingLogs, setEditingLogs] = useState<Record<string, string>>({});
    const [logSaving, setLogSaving] = useState<boolean>(false);
    // State for collapsible task logs (open indexes)
    const [openLogIndexes, setOpenLogIndexes] = useState<number[]>([]);
    // State of task log copy button
    const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
    // State for action menu
    const [menuAnchorEl, setMenuAnchorEl] = useState<{ [key: string]: HTMLButtonElement | null }>({});
    // Helper function to load automation settings from localStorage (shared with CasePage)
    const loadAutomationSettings = () => {
        try {
            const saved = localStorage.getItem("caseAutomationSettings");
            if (saved) {
                return JSON.parse(saved);
            }
        } catch {
            // If parsing fails, fall back to defaults
        }
        return null;
    };
    const savedSettings = loadAutomationSettings();
    // State for investigation modal - initialized from shared localStorage
    const [investigationModalOpen, setInvestigationModalOpen] = useState<boolean>(false);
    const [investigationLogMessage, setInvestigationLogMessage] = useState<string>("");
    const [investigationLogId, setInvestigationLogId] = useState<string>("");
    const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(savedSettings?.enableWebSearch?.siem_investigation ?? false);
    const [earliestMagnitude, setEarliestMagnitude] = useState<number | "">(savedSettings?.earliestMagnitude ?? 1);
    const [earliestUnit, setEarliestUnit] = useState<string>(savedSettings?.earliestUnit ?? "years");
    const [vicinityMagnitude, setVicinityMagnitude] = useState<number | "">(savedSettings?.vicinityMagnitude ?? 1);
    const [vicinityUnit, setVicinityUnit] = useState<string>(savedSettings?.vicinityUnit ?? "hours");
    const [maxIterations, setMaxIterations] = useState<number | "">(savedSettings?.maxIterations ?? 3);
    const [additionalNotes, setAdditionalNotes] = useState<string>(savedSettings?.additionalNotes ?? "");
    const navigate = useNavigate();
    const handleLogInvestigate = (logMessage: string, logId: string) => {
        setInvestigationLogMessage(logMessage);
        setInvestigationLogId(logId);
        setInvestigationModalOpen(true);
    };
    const correctEarliestMagnitude = () => {
        if (typeof earliestMagnitude === "string" || earliestMagnitude <= 0) {
            setEarliestMagnitude(1);
            return 1;
        }
        return earliestMagnitude;
    };
    const correctVicinityMagnitude = () => {
        if (typeof vicinityMagnitude === "string" || vicinityMagnitude <= 0) {
            setVicinityMagnitude(1);
            return 1;
        }
        return vicinityMagnitude;
    };
    const correctMaxIterations = () => {
        if (typeof maxIterations === "string" || maxIterations <= 0) {
            setMaxIterations(1);
            return 1;
        }
        return maxIterations;
    };
    const investigateActivity = async () => {
        const correctedEarliestMagnitude = correctEarliestMagnitude();
        const correctedVicinityMagnitude = correctVicinityMagnitude();
        const correctedMaxIterations = correctMaxIterations();
        const requestBody = new FormData();
        requestBody.append("siem_id", targetSIEM?.id || "");
        requestBody.append("soar_id", targetSOAR?.id || "");
        requestBody.append("org_id", orgId || "");
        requestBody.append("case_id", caseId || "");
        requestBody.append("activity_id", investigationLogId);
        requestBody.append("earliest_magnitude", correctedEarliestMagnitude.toString());
        requestBody.append("earliest_unit", earliestUnit);
        requestBody.append("vicinity_magnitude", correctedVicinityMagnitude.toString());
        requestBody.append("vicinity_unit", vicinityUnit);
        requestBody.append("max_iterations", correctedMaxIterations.toString());
        requestBody.append("additional_notes", additionalNotes);
        console.log("start investigation");
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}ai_backend/automatic_investigation/investigate_activity/`,
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
            if (response.ok && rawData.message === "Success") {
                setSnackbarSuccessful(true);
                setSnackbarMessage("Investigation started successfully.");
            } else {
                setSnackbarSuccessful(false);
                setSnackbarMessage(rawData.error || "Failed to start investigation.");
            }
        } catch (error) {
            console.log(error);
            setSnackbarSuccessful(false);
            setSnackbarMessage("Failed to start investigation: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            console.log("showing snackbar");
            setSnackbarOpen(true);
        }
    };
    const handleInvestigate = async () => {
        const correctedEarliestMagnitude = correctEarliestMagnitude();
        const correctedVicinityMagnitude = correctVicinityMagnitude();
        const correctedMaxIterations = correctMaxIterations();
        // Update the shared automation settings in localStorage
        const currentSettings = loadAutomationSettings() || {};
        const updatedSettings = {
            ...currentSettings,
            earliestMagnitude: correctedEarliestMagnitude,
            earliestUnit: earliestUnit,
            vicinityMagnitude: correctedVicinityMagnitude,
            vicinityUnit: vicinityUnit,
            maxIterations: correctedMaxIterations,
            enableWebSearch: {
                ...currentSettings.enableWebSearch,
                siem_investigation: webSearchEnabled
            }
        };
        localStorage.setItem("caseAutomationSettings", JSON.stringify(updatedSettings));
        // Store the investigation context in localStorage for SIEMQueryAgent use
        localStorage.setItem("taskLogForInvestigation", investigationLogMessage);
        localStorage.setItem("caseAutomationSettings", JSON.stringify({
            ...loadAutomationSettings(),
            earliestMagnitude: correctedEarliestMagnitude,
            earliestUnit,
            vicinityMagnitude: correctedVicinityMagnitude,
            vicinityUnit,
            maxIterations: correctedMaxIterations,
            enableWebSearch: {
                ...loadAutomationSettings()?.enableWebSearch,
                siem_investigation: webSearchEnabled
            },
            additionalNotes
        }));
        setInvestigationModalOpen(false);
        await investigateActivity();
    };
    const debouncedInvestigateActivity = debounce(handleInvestigate, 300);
    const toggleLogOpen = (index: number) => {
        setOpenLogIndexes(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    }
    const getTaskData = async () => {
        const rawData = await fetchTaskDataApi({
            backendUrl: process.env.REACT_APP_BACKEND_URL || "",
            token: cookies.token,
            soarId: targetSOAR?.id || "",
            orgId: orgId || "",
            taskId: taskId || "",
        });
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
        const rawData = await fetchTaskLogsApi({
            backendUrl: process.env.REACT_APP_BACKEND_URL || "",
            token: cookies.token,
            soarId: targetSOAR?.id || "",
            taskId: taskId || "",
        });
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
        const rawData = await saveTaskLogApi({
            backendUrl: process.env.REACT_APP_BACKEND_URL || "",
            token: cookies.token,
            soarId: targetSOAR?.id || "",
            taskId: taskData?.id || "",
            taskLogId: logId,
            taskLogData: logValue,
        });
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
    const handleTaskLogDelete = async (logId: string) => {
        const rawData = await deleteTaskLogApi({
            backendUrl: process.env.REACT_APP_BACKEND_URL || "",
            token: cookies.token,
            soarId: targetSOAR?.id || "",
            taskId: taskData?.id || "",
            taskLogId: logId,
        });
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
        handleLogInvestigate(message, logId);
        handleMenuClose(logId);
    };
    const handleStartEdit = (logId: string, index: number, message: string) => {
        setEditingLogs((prev) => ({ ...prev, [logId]: message }));
        setOpenLogIndexes((prev) => (prev.includes(index) ? prev : [...prev, index]));
    };
    const handleSaveEdit = async (logId: string) => {
        const value = editingLogs[logId];
        if (typeof value !== "string") {
            return;
        }

        await handleTaskLogSave(logId, value);
        setEditingLogs((prev) => {
            const next = { ...prev };
            delete next[logId];
            return next;
        });
    };
    const handleCancelEdit = (logId: string) => {
        setEditingLogs((prev) => {
            const next = { ...prev };
            delete next[logId];
            return next;
        });
    };
    const handleDeleteAndClose = async (logId: string) => {
        await handleTaskLogDelete(logId);
        handleMenuClose(logId);
    };

    useEffect(() => {
        if (!targetSOAR) {
            return;
        }
        getTaskData();
        getTaskLogs();
    }, [targetSOAR]);

    useEffect(() => {
        return () => {
            debouncedInvestigateActivity.cancel();
        };
    }, [debouncedInvestigateActivity]);

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
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={5000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbarOpen(false)}
                        severity={snackbarSuccessful ? 'success' : 'error'}
                        variant="filled"
                        sx={{ width: '100%', color: 'primary.main' }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5, height: "100vh", minHeight: 0, overflow: "auto", display: 'flex', flexDirection: 'column' }}>
                    {targetSOAR ? (
                        errorMessage.length > 0 ? (
                            <Typography variant="body1">{errorMessage}</Typography>
                        ) : (
                            <>
                                {taskData ? (
                                    <>
                                        <TaskPageHeaderDetails taskData={taskData} onBack={() => navigate(-1)} />
                                        <TaskLogSection
                                            taskData={taskData}
                                            taskLogs={taskLogs}
                                            openLogIndexes={openLogIndexes}
                                            editingLogs={editingLogs}
                                            logSaving={logSaving}
                                            copySuccessId={copySuccessId}
                                            menuAnchorEl={menuAnchorEl}
                                            onToggleLogOpen={toggleLogOpen}
                                            onStartEdit={handleStartEdit}
                                            onSave={handleSaveEdit}
                                            onCancelEdit={handleCancelEdit}
                                            onCopy={handleCopyLog}
                                            onMenuOpen={handleMenuOpen}
                                            onMenuClose={handleMenuClose}
                                            onInvestigate={handleInvestigateAndClose}
                                            onDelete={handleDeleteAndClose}
                                            onEditingChange={(logId, value) => {
                                                if (typeof value !== "string") {
                                                    return;
                                                }

                                                setEditingLogs((prev) => {
                                                    if (!Object.prototype.hasOwnProperty.call(prev, logId)) {
                                                        return prev;
                                                    }

                                                    return { ...prev, [logId]: value };
                                                });
                                            }}
                                        />
                                        <Box sx={{ position: "fixed", bottom: 12, right: 12 }}>
                                            <SIEMQueryAgent />
                                        </Box>
                                        <TaskInvestigationDialog
                                            open={investigationModalOpen}
                                            onClose={() => setInvestigationModalOpen(false)}
                                            webSearchEnabled={webSearchEnabled}
                                            setWebSearchEnabled={setWebSearchEnabled}
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
                                            onInvestigate={debouncedInvestigateActivity}
                                        />
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
