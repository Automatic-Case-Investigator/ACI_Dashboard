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


export const SIEMQueryAgent = () => {
    const [cookies, _setCookies, removeCookies] = useCookies(['token']);
    const [open, setOpen] = useState<boolean>(false);
    const [response, setResponse] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
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

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    const handleSend = async () => {
        setLoading(true);
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
            setLoading(false);
        }
    };

    const openingButtonStyle = {
        backgroundColor: '#CCCCFF22',
        '&:hover': {
            backgroundColor: '#CCCCFF33',
        },
        boxShadow: 2,
        border: '1px solid #bdbfff',
    };

    const editorBoxStyle = {
        borderRadius: 2,
        background: '#181a20',
        overflow: 'hidden',
        mb: 2,
        p: 1,
        display: 'flex',
        flexDirection: 'column',
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
                            background: '#23263a',
                            borderRadius: 8,
                            border: '1.5px solid #bdbfff',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
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
                        <Box p={2} sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography color="#bdbfff">SIEM Query Agent</Typography>
                                <Box>
                                    <IconButton onClick={() => setOpen(false)} size="small" sx={{ color: '#bdbfff' }}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <TextField size="small" placeholder="(WIP) Describe what you want to query..." fullWidth />
                                <IconButton>
                                    <ArrowForwardIcon />
                                </IconButton>
                            </Box>
                            <PanelGroup direction="horizontal" style={{ height: '100%' }}>
                                <Panel minSize={20} defaultSize={50} style={{ display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ ...editorBoxStyle, flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle2" sx={{ mb: 0.5, color: '#bdbfff' }}>Request Body</Typography>
                                        <Button
                                            size="small"
                                            sx={{height: 24}}
                                            variant="outlined"
                                            onClick={handleSend}
                                            disabled={loading}
                                            color="primary"
                                        >
                                            {loading ? 'Sending...' : 'Send'}
                                        </Button>
                                        </Box>
                                        <Box sx={{ flex: 1, mt: 0.5, display: 'flex', flexDirection: 'column' }}>
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
                                <PanelResizeHandle style={{ border: '1px solid #444', background: '#444', cursor: 'row-resize' }} />
                                <Panel minSize={20} defaultSize={50} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Box sx={{ ...editorBoxStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5, color: '#bdbfff' }}>Query Response</Typography>
                                        <Box sx={{ flex: 1, mt: 0.5, display: 'flex', flexDirection: 'column' }}>
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
