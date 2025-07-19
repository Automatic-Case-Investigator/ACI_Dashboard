import { IconButton, Tooltip, Popover, Box, Typography, Button } from '@mui/material';
import { useState, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import MonacoEditor from '@monaco-editor/react';
import { useCookies } from 'react-cookie';
import { TargetSIEMInfo } from '../../types/types';

export const SIEMQueryAgent = () => {
    const [cookies, _setCookies, removeCookies] = useCookies(['token']);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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

    const open = Boolean(anchorEl);

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
            <IconButton sx={openingButtonStyle} onClick={(event) => setAnchorEl(event.currentTarget)}>
                <Tooltip title="SIEM Query Agent" placement="left">
                    <CodeIcon />
                </Tooltip>
            </IconButton>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                disableEnforceFocus
                disableAutoFocus
                disableRestoreFocus
                slotProps={{
                    paper: {
                        style: {
                            pointerEvents: 'auto',
                            borderRadius: 8,
                            background: '#23263a',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                            border: '1.5px solid #bdbfff',
                        }
                    },
                }}
            >
                <Box p={2} sx={{ width: 540, height: 540, display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 2, borderBottom: '1px solid #444', mb: 2 }}>
                        <Typography color="#bdbfff">SIEM Query Agent</Typography>
                        <Box>
                            <IconButton onClick={() => {
                                setAnchorEl(null);
                            }} size="small" sx={{ color: '#bdbfff' }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box sx={{ ...editorBoxStyle, flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, color: '#bdbfff' }}>Request Body</Typography>
                        <MonacoEditor
                            height="100%"
                            defaultLanguage="json"
                            defaultValue={localStorage.getItem("SIEMQueryAgentRequestBodyValue") || ""}
                            theme="vs-dark"
                            onChange={(value) => {
                                localStorage.setItem("SIEMQueryAgentRequestBodyValue", value || "");
                            }}
                            onMount={handleEditorDidMount}
                            options={{ minimap: { enabled: true }, fontSize: 15, fontFamily: 'Fira Mono, monospace', lineNumbers: 'on', scrollbar: { vertical: 'auto' } }}
                        />
                    </Box>
                    <Button sx={{ mt: 1, mb: 2, alignSelf: 'flex-end', minWidth: 100, letterSpacing: 1 }} variant="contained" onClick={handleSend} disabled={loading} loading={loading} color="primary">
                        Send
                    </Button>
                    <Box sx={{ ...editorBoxStyle, flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, color: '#bdbfff' }}>Query Response</Typography>
                        <MonacoEditor
                            height="100%"
                            defaultLanguage="json"
                            value={response}
                            theme="vs-dark"
                            options={{ minimap: { enabled: true }, fontSize: 15, fontFamily: 'Fira Mono, monospace', lineNumbers: 'on', scrollbar: { vertical: 'auto' }, readOnly: true }}
                        />
                    </Box>
                </Box>
            </Popover>
        </>
    );
}
