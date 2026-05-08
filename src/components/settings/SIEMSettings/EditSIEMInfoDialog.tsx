import {
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
    DialogActions,
    DialogContent,
    DialogTitle,
    SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import React, { useEffect, useState } from 'react';
import { SIEM_CHOICES } from '../../../constants/platform-choices';
import { EditSIEMInfoDialogProps, SIEMConfigFile } from '../../../types/types';
import { useCookies } from 'react-cookie';

const isValidURL = (url: string): boolean => {
    const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return urlPattern.test(url);
};

export const EditSIEMInfoDialog: React.FC<EditSIEMInfoDialogProps> = ({
    selectedSiemData,
    onClose,
    onSave,
}) => {
    const [cookies, _setCookie, removeCookies] = useCookies(['token']);
    const [currentName, setCurrentName] = useState<string>(
        selectedSiemData?.name || ''
    );
    const [currentType, setCurrentType] = useState<string>(
        selectedSiemData?.type || Object.values(SIEM_CHOICES)[0]
    );
    const [currentURL, setCurrentURL] = useState<string>(
        selectedSiemData?.url || ''
    );
    const [currentAPIKey, setCurrentAPIKey] = useState<string>(
        selectedSiemData?.apiKey || ''
    );
    const [useAPIKey, setUseAPIKey] = useState<boolean>(
        selectedSiemData?.useAPIKey || false
    );
    const [currentUsername, setCurrentUsername] = useState<string>(
        selectedSiemData?.username || ''
    );
    const [currentPassword, setCurrentPassword] = useState<string>(
        selectedSiemData?.password || ''
    );
    const [configFiles, setConfigFiles] = useState<SIEMConfigFile[]>(
        selectedSiemData?.configFiles || []
    );
    const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const addConfigFile = () => setConfigFiles([...configFiles, { filename: '', file: null }]);
    const removeConfigFile = (i: number) => setConfigFiles(configFiles.filter((_, idx) => idx !== i));
    const getSha256Hex = async (inputFile: File): Promise<string> => {
        const data = await inputFile.arrayBuffer();
        const digestBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(digestBuffer))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    };

    const updateConfigFileUpload = async (i: number, uploadedFile: File | null) => {
        if (!uploadedFile) {
            return;
        }

        const hashDigest = await getSha256Hex(uploadedFile);

        setConfigFiles(
            configFiles.map((file, idx) =>
                idx === i
                    ? {
                        ...file,
                        file: uploadedFile,
                        filename: uploadedFile?.name || file.filename,
                        hashDigest,
                    }
                    : file
            )
        );
    };

    const triggerDownload = (blob: Blob, filename: string) => {
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(objectUrl);
    };

    const handleDownloadConfigFile = async (file: SIEMConfigFile, index: number) => {
        setDownloadingIndex(index);
        try {
            const filename = file.filename || file.file?.name;
            if (!filename) {
                return;
            }

            if (file.file) {
                triggerDownload(file.file, filename);
                return;
            }

            if (!selectedSiemData?.id) {
                return;
            }

            const query = new URLSearchParams({
                siem_id: selectedSiemData.id.toString(),
                filename,
            });

            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}siem/config_file/?${query.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${cookies.token}`,
                    },
                }
            );

            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const responseJson = await response.json();
                if (responseJson.code && responseJson.code === 'token_not_valid') {
                    removeCookies('token');
                    return;
                }
            }

            if (!response.ok) {
                throw new Error('Failed to download config file');
            }

            const fileBlob = await response.blob();
            triggerDownload(fileBlob, filename);
        } catch (error) {
            console.error('Error downloading config file:', error);
        } finally {
            setDownloadingIndex(null);
        }
    };

    useEffect(() => {
        setCurrentName(selectedSiemData?.name || '');
        setCurrentType(selectedSiemData?.type || Object.values(SIEM_CHOICES)[0]);
        setCurrentURL(selectedSiemData?.url || '');
        setCurrentAPIKey(selectedSiemData?.apiKey || '');
        setUseAPIKey(selectedSiemData?.useAPIKey || false);
        setCurrentUsername(selectedSiemData?.username || '');
        setCurrentPassword(selectedSiemData?.password || '');
        setConfigFiles(selectedSiemData?.configFiles || []);
    }, [selectedSiemData]);

    return (
        <>
            <DialogTitle id="alert-dialog-title">Edit SIEM Information</DialogTitle>
            <DialogContent>
                <Typography>Name</Typography>
                <TextField
                    size="small"
                    fullWidth
                    value={currentName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentName(e.target.value)
                    }
                />

                <Typography>Type</Typography>
                <Select
                    size="small"
                    fullWidth
                    value={currentType}
                    onChange={(e: SelectChangeEvent<string>) => setCurrentType(e.target.value)}
                >
                    {Object.values(SIEM_CHOICES).map((siemType) => (
                        <MenuItem key={siemType} value={siemType}>
                            {siemType}
                        </MenuItem>
                    ))}
                </Select>

                <Typography>URL</Typography>
                <TextField
                    size="small"
                    fullWidth
                    type="url"
                    value={currentURL}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentURL(e.target.value)
                    }
                />
                {!isValidURL(currentURL) && (
                    <Typography color="error.main">Invalid URL</Typography>
                )}

                <Typography>Authentication Type</Typography>
                <Select
                    size="small"
                    fullWidth
                    value={useAPIKey.toString()}
                    onChange={(e: SelectChangeEvent<string>) =>
                        setUseAPIKey(e.target.value === 'true')
                    }
                >
                    <MenuItem value="true">API Key</MenuItem>
                    <MenuItem value="false">Username / Password</MenuItem>
                </Select>

                {useAPIKey ? (
                    <>
                        <Typography>API Key</Typography>
                        <TextField
                            size="small"
                            fullWidth
                            value={currentAPIKey}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setCurrentAPIKey(e.target.value)
                            }
                        />
                    </>
                ) : (
                    <>
                        <Typography>Username</Typography>
                        <TextField
                            size="small"
                            fullWidth
                            value={currentUsername}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setCurrentUsername(e.target.value)
                            }
                        />
                        <Typography>Password</Typography>
                        <TextField
                            type="password"
                            size="small"
                            fullWidth
                            value={currentPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setCurrentPassword(e.target.value)
                            }
                        />
                    </>
                )}

                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1">Configuration Files</Typography>
                    <Tooltip title="Add file">
                        <IconButton size="small" onClick={addConfigFile}><AddIcon fontSize="small" /></IconButton>
                    </Tooltip>
                </Box>
                {configFiles.map((file, i) => (
                    <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Stored Filename
                                </Typography>
                                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                    {file.filename || 'No stored filename'}
                                </Typography>
                            </Box>
                            <Tooltip title="Remove">
                                <IconButton size="small" onClick={() => removeConfigFile(i)}><DeleteIcon fontSize="small" /></IconButton>
                            </Tooltip>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button component="label" variant="outlined" size="small">
                                    {file.file ? 'Replace file' : 'Upload file'}
                                    <input
                                        hidden
                                        type="file"
                                        onChange={async (e: React.ChangeEvent<HTMLInputElement>) =>
                                            await updateConfigFileUpload(i, e.target.files?.[0] || null)
                                        }
                                    />
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={downloadingIndex === i ? <CircularProgress size={14} /> : <DownloadIcon />}
                                    onClick={async () => await handleDownloadConfigFile(file, i)}
                                    disabled={downloadingIndex === i || (!file.filename && !file.file)}
                                >
                                    {downloadingIndex === i ? 'Downloading...' : 'Download'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                ))}
            </DialogContent>
            <DialogActions>
                <Button color="warning" onClick={onClose} disabled={isSaving}>
                    Cancel
                </Button>
                <Button
                    color="info"
                    onClick={async () => {
                        setIsSaving(true);
                        try {
                            await Promise.resolve(
                                onSave({
                                    id: selectedSiemData?.id ?? -1,
                                    name: currentName,
                                    type: currentType,
                                    url: currentURL,
                                    useAPIKey,
                                    apiKey: currentAPIKey,
                                    username: currentUsername,
                                    password: currentPassword,
                                    configFiles,
                                })
                            );
                            onClose();
                        } finally {
                            setIsSaving(false);
                        }
                    }}
                    autoFocus
                    disabled={!isValidURL(currentURL) || isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </>
    );
};
