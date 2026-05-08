import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Tooltip, Typography, Paper, MenuItem } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import RefreshIcon from '@mui/icons-material/Refresh';
import { useCookies } from "react-cookie";
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { fetchAgentSettingsData, fetchAIBackendStatus, isTokenNotValid, saveAgentSettingsData } from "./agentSettingsApi";

export const AgentSettings = () => {
    const [cookies, , removeCookies] = useCookies(["token"]);
    const [AIBackendConnected, setAIBackendConnected] = useState<boolean>(false);
    const [maxConcurrentAgents, setMaxConcurrentAgents] = useState<number | "">(3);
    const [reportTemplates, setReportTemplates] = useState<Record<string, string>>({});
    const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("");
    const [newTemplateName, setNewTemplateName] = useState<string>("");
    const [loadingSettings, setLoadingSettings] = useState<boolean>(false);
    const [savingSettings, setSavingSettings] = useState<boolean>(false);
    const [settingsError, setSettingsError] = useState<string>("");
    const [saveSuccess, setSaveSuccess] = useState<string>("");

    const templateKeys = Object.keys(reportTemplates);

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "";

    const handleTokenInvalidResponse = (code?: string): boolean => {
        if (!isTokenNotValid(code)) {
            return false;
        }

        removeCookies("token");
        return true;
    };

    const testAIBackendConnection = async () => {
        const responseJson = await fetchAIBackendStatus(
            backendUrl,
            cookies.token
        );

        if (handleTokenInvalidResponse(responseJson.code)) {
            return;
        }

        setAIBackendConnected(responseJson.connected ?? false);
    };

    const fetchAgentSettings = async () => {
        setLoadingSettings(true);
        setSettingsError("");

        try {
            const { ok, data } = await fetchAgentSettingsData(
                backendUrl,
                cookies.token
            );

            if (handleTokenInvalidResponse(data.code)) {
                return;
            }

            if (!ok) {
                setSettingsError(data.error || "Failed to fetch agent settings.");
                return;
            }

            const templates = data.settings?.report_templates || {};
            setReportTemplates(templates);
            setSelectedTemplateKey(Object.keys(templates)[0] || "");
        } catch (error) {
            setSettingsError("Failed to fetch agent settings.");
        } finally {
            setLoadingSettings(false);
        }
    };

    const saveAgentSettings = async () => {
        setSavingSettings(true);
        setSettingsError("");
        setSaveSuccess("");

        try {
            const { ok, data } = await saveAgentSettingsData(
                backendUrl,
                cookies.token,
                reportTemplates
            );

            if (handleTokenInvalidResponse(data.code)) {
                return;
            }

            if (!ok) {
                setSettingsError(data.error || "Failed to save agent settings.");
                return;
            }

            const templates = data.settings?.report_templates || {};
            setReportTemplates(templates);
            setSelectedTemplateKey((currentKey) => {
                if (currentKey && templates[currentKey] !== undefined) {
                    return currentKey;
                }
                return Object.keys(templates)[0] || "";
            });
            setSaveSuccess("Report template saved.");
        } catch (error) {
            setSettingsError("Failed to save agent settings.");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleTemplateContentChange = (value: string) => {
        if (!selectedTemplateKey) {
            return;
        }

        setReportTemplates((prev) => ({
            ...prev,
            [selectedTemplateKey]: value,
        }));
    };

    const createTemplate = () => {
        const key = newTemplateName.trim();
        setSaveSuccess("");

        if (!key) {
            setSettingsError("Template name is required.");
            return;
        }

        if (reportTemplates[key] !== undefined) {
            setSettingsError("A template with this name already exists.");
            return;
        }

        setSettingsError("");
        setReportTemplates((prev) => ({
            ...prev,
            [key]: "",
        }));
        setSelectedTemplateKey(key);
        setNewTemplateName("");
    };

    const deleteTemplate = () => {
        if (!selectedTemplateKey) {
            return;
        }

        setSaveSuccess("");
        setSettingsError("");

        setReportTemplates((prev) => {
            const next = { ...prev };
            delete next[selectedTemplateKey];
            const nextKeys = Object.keys(next);
            setSelectedTemplateKey(nextKeys[0] || "");
            return next;
        });
    };

    function handleEditorDidMount(
        editor: editor.IStandaloneCodeEditor
    ) {
        editorRef.current = editor;

        requestAnimationFrame(() => {
            editor.layout();
        });
    }

    const refresh = async () => {
        setSaveSuccess("");
        await Promise.all([testAIBackendConnection(), fetchAgentSettings()]);
    };

    useEffect(() => {
        refresh();
    }, []);

    useEffect(() => {
        if (!editorContainerRef.current) {
            return;
        }

        const observer = new ResizeObserver(() => {
            editorRef.current?.layout();
        });

        observer.observe(editorContainerRef.current);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <Box mb={2}>
            <Typography variant="h6">AI Backend</Typography>

            <Paper sx={{ p: 2, mt: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography sx={{ marginRight: 1 }}>AI Backend Status:</Typography>
                        <Typography sx={{ color: AIBackendConnected ? "success.main" : "error.main" }}>
                            {AIBackendConnected ? "Connected" : "Disconnected"}
                        </Typography>
                    </Box>

                    <Tooltip title="Refresh">
                        <IconButton onClick={refresh}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 2 }}>
                    <Typography>Max Concurrent Agents:</Typography>
                    <TextField
                        type="number"
                        size="small"
                        value={maxConcurrentAgents}
                        onChange={(e) => setMaxConcurrentAgents(e.target.value === "" ? "" : Number(e.target.value))}
                        inputProps={{ min: 1, max: 100 }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">agents</InputAdornment>
                        }}
                        sx={{ width: 160 }}
                    />
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Typography sx={{ mb: 1 }}>Report Templates:</Typography>

                    <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                        <TextField
                            label="New template name"
                            size="small"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            disabled={loadingSettings || savingSettings}
                            sx={{ minWidth: 220 }}
                        />
                        <Button
                            variant="outlined"
                            onClick={createTemplate}
                            disabled={loadingSettings || savingSettings}
                        >
                            Create
                        </Button>
                    </Box>

                    <TextField
                        fullWidth
                        select
                        label="Template"
                        size="small"
                        value={selectedTemplateKey}
                        onChange={(e) => {
                            setSaveSuccess("");
                            setSettingsError("");
                            setSelectedTemplateKey(e.target.value);
                        }}
                        disabled={loadingSettings || savingSettings || templateKeys.length === 0}
                        sx={{ mb: 1 }}
                    >
                        {templateKeys.map((key) => (
                            <MenuItem key={key} value={key}>
                                {key}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={deleteTemplate}
                            disabled={loadingSettings || savingSettings || !selectedTemplateKey}
                        >
                            Delete Selected
                        </Button>
                    </Box>

                    <Box
                        ref={editorContainerRef}
                        sx={{
                            resize: "vertical",
                            overflow: "hidden",
                            minHeight: 220,
                            maxHeight: 700,
                            height: 320,
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                        }}
                    >
                        <Editor
                            height="100%"
                            defaultLanguage="markdown"
                            value={selectedTemplateKey ? (reportTemplates[selectedTemplateKey] || "") : ""}
                            onMount={(editor) => handleEditorDidMount(editor)}
                            onChange={(value) => handleTemplateContentChange(value || '')}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: true },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                lineNumbers: 'on',
                                folding: false,
                                automaticLayout: false,
                                fontSize: 14,
                            }}
                        />
                    </Box>
                </Box>

                {loadingSettings && (
                    <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 1 }}>
                        <CircularProgress size={18} />
                        <Typography variant="body2">Loading settings...</Typography>
                    </Box>
                )}

                {settingsError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {settingsError}
                    </Alert>
                )}

                {saveSuccess && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        {saveSuccess}
                    </Alert>
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={saveAgentSettings}
                        disabled={loadingSettings || savingSettings}
                    >
                        Save
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};