import { IconButton, Tooltip, Box, Typography, Button, TextField } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { TargetSIEMInfo } from '../../../types/types';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import MonacoEditor from '@monaco-editor/react';
import { useCookies } from 'react-cookie';
import { useState, useRef } from 'react';
import { Resizable } from 're-resizable';
import { debounce } from 'lodash';
import { SIEM_QUERY_AGENT_COLORS } from '../../../themes/colors';


export const SIEMQueryAgent = () => {
    const [cookies, _setCookies, removeCookies] = useCookies(['token']);
    const [open, setOpen] = useState<boolean>(false);
    const [response, setResponse] = useState<string>('');
    const [queryLoading, setQueryLoading] = useState<boolean>(false);
    const [generationLoading, setGenerationLoading] = useState<boolean>(false);
    const [userPrompt, setUserPrompt] = useState<string>("");
    const editorRef = useRef<any>(null);

    const [targetSIEM, _setTargetSIEM] = useState<TargetSIEMInfo | null>(() => {
        try {
            const saved = localStorage.getItem("targetSIEM");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [size, setSize] = useState({ width: 1000, height: 450 });

    const palette = SIEM_QUERY_AGENT_COLORS;

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    const handleQueryGenerate = async () => {
        setGenerationLoading(true);
        try {
            const requestBody = new FormData();
            requestBody.append("prompt", userPrompt);
            const response = await fetch(
                process.env.REACT_APP_BACKEND_URL + `ai_backend/automatic_investigation/query_generation_model/generate/`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${cookies.token}`,
                        "Accept": "application/json"
                    },
                    body: requestBody
                }
            );
            const query = (await response.json())["query"];
            if (query) {
                localStorage.setItem("SIEMQueryAgentRequestBodyValue", query);
                editorRef.current?.setValue(query);
            }
        } catch (err: any) {
            ;
        } finally {
            setGenerationLoading(false);
        }
    }

    const debouncedHandleQueryGenerate = debounce(handleQueryGenerate, 500);

    const handleSend = async () => {
        setQueryLoading(true);
        try {
            const value = editorRef.current?.getValue() || '{}';
            const requestBody = new FormData();
            requestBody.append('query', value);
            requestBody.append('siem_id', targetSIEM?.id || '');
            const response = await fetch(
                process.env.REACT_APP_BACKEND_URL + `siem/siem_query/`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${cookies.token}`,
                        "Accept": "application/json"
                    },
                    body: requestBody
                }
            );
            const responseJson = await response.json();
            if (responseJson.code && responseJson.code === "token_not_valid") {
                removeCookies("token");
                return;
            }
            setResponse(JSON.stringify(responseJson, null, 2));
        } catch (err: any) {
            setResponse('');
        } finally {
            setQueryLoading(false);
        }
    };

    const openingButtonStyle = {
        backgroundColor: palette.launcherBg,
        '&:hover': {
            backgroundColor: palette.launcherHover,
        },
        color: palette.textPrimary,
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
        border: `1px solid ${palette.launcherBorder}`,
        backdropFilter: 'blur(4px)',
    };

    const editorBoxStyle = {
        borderRadius: 2,
        background: palette.surfaceBg,
        border: `1px solid ${palette.panelBorder}`,
        overflow: 'hidden',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
    };

    return (
        <>
            <IconButton
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    ...openingButtonStyle
                }}
                onClick={() => setOpen(true)}
            >
                <Tooltip title="SIEM Query Agent" placement="left">
                    <CodeIcon />
                </Tooltip>
            </IconButton>

            {open && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 80,
                        right: 20,
                        zIndex: 1300,
                    }}
                >
                    <Resizable
                        size={size}
                        onResizeStop={(_e, _direction, _ref, d) => {
                            setSize({
                                width: size.width + d.width,
                                height: size.height + d.height,
                            });
                        }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            background: palette.panelBg,
                            border: `1px solid ${palette.panelBorder}`,
                            borderRadius: 8,
                            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
                            overflow: 'hidden',
                        }}
                        minWidth={350}
                        minHeight={400}
                        enable={{
                            top: true,
                            right: true,
                            bottom: true,
                            left: true,
                            topRight: true,
                            bottomRight: true,
                            bottomLeft: true,
                            topLeft: true,
                        }}
                    >
                        <Box p={2} sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', gap: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" sx={{ color: palette.textPrimary, fontWeight: 600 }}>
                                    SIEM Query Agent
                                </Typography>
                                <IconButton onClick={() => setOpen(false)} size="small" sx={{ color: palette.textMuted }}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ gap: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder="(WIP) Describe what you want to query..."
                                    value={userPrompt}
                                    onChange={(e) => setUserPrompt(e.target.value)}
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: palette.surfaceBg,
                                            color: palette.textPrimary,
                                            '& fieldset': { borderColor: palette.panelBorder },
                                            '&:hover fieldset': { borderColor: palette.textMuted },
                                        },
                                        '& .MuiInputBase-input::placeholder': {
                                            color: palette.textMuted,
                                            opacity: 1,
                                        },
                                    }}
                                />
                                <IconButton
                                    onClick={debouncedHandleQueryGenerate}
                                    disabled={generationLoading}
                                    loading={generationLoading}
                                    sx={{ color: palette.textPrimary, bgcolor: palette.surfaceBg, border: `1px solid ${palette.panelBorder}`, borderRadius: 1.5 }}
                                >
                                    <ArrowForwardIcon />
                                </IconButton>
                            </Box>
                            <PanelGroup direction="horizontal" style={{ height: '100%', minHeight: 0 }}>
                                <Panel minSize={20} defaultSize={50} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                    <Box sx={editorBoxStyle} flex={1} display='flex' flexDirection='column' height='100%'>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle2" sx={{ mb: 0.5, color: palette.textPrimary }}>Request Body</Typography>
                                            <Button
                                                size="small"
                                                sx={{ height: 24 }}
                                                variant="contained"
                                                onClick={handleSend}
                                                disabled={queryLoading}
                                                color="inherit">
                                                {queryLoading ? 'Sending...' : 'Send'}
                                            </Button>
                                        </Box>
                                        <Box flex={1} display='flex' flexDirection='column' mt={0.5}>
                                            <MonacoEditor
                                                height="100%"
                                                width="100%"
                                                defaultLanguage="json"
                                                defaultValue={localStorage.getItem("SIEMQueryAgentRequestBodyValue") || ""}
                                                theme="vs-dark"
                                                onChange={(value) => {
                                                    localStorage.setItem("SIEMQueryAgentRequestBodyValue", value || "");
                                                }}
                                                onMount={handleEditorDidMount}
                                                options={{
                                                    minimap: { enabled: true },
                                                    fontSize: 15,
                                                    fontFamily: 'Fira Mono, monospace',
                                                    lineNumbers: 'on',
                                                    scrollbar: { vertical: 'auto' },
                                                    automaticLayout: true,
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Panel>
                                <PanelResizeHandle style={{ width: 6, borderRadius: 3, margin: '0 6px', background: palette.handle, cursor: 'col-resize' }} />
                                <Panel minSize={20} defaultSize={50} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                                    <Box sx={editorBoxStyle} flex={1} display='flex' flexDirection='column' height='100%'>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5, color: palette.textPrimary }}>Query Response</Typography>
                                        <Box flex={1} display='flex' flexDirection='column' mt={0.5}>
                                            <MonacoEditor
                                                height="100%"
                                                width="100%"
                                                defaultLanguage="json"
                                                value={response}
                                                theme="vs-dark"
                                                options={{
                                                    minimap: { enabled: true },
                                                    fontSize: 15,
                                                    fontFamily: 'Fira Mono, monospace',
                                                    lineNumbers: 'on',
                                                    scrollbar: { vertical: 'auto' },
                                                    readOnly: true,
                                                    automaticLayout: true,
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Panel>
                            </PanelGroup>
                        </Box>
                    </Resizable>
                </Box>
            )}
        </>
    );
};
