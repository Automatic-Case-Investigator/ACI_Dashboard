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
import React, { useState } from 'react';
import { SIEM_CHOICES } from '../../../constants/platform-choices';
import { CallbackFunction, SIEMConfigFile } from '../../../types/types';

interface NewSIEMInfoDialogProps {
    onClose: CallbackFunction;
    onCreate: CallbackFunction;
}

const isValidURL = (url: string): boolean => {
    const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return urlPattern.test(url);
};


export const NewSIEMInfoDialog: React.FC<NewSIEMInfoDialogProps> = ({ onClose, onCreate }) => {
    const [currentName, setCurrentName] = useState<string>('');
    const [currentType, setCurrentType] = useState<string>(Object.values(SIEM_CHOICES)[0]);
    const [useAPIKey, setUseAPIKey] = useState<boolean>(false);
    const [currentURL, setCurrentURL] = useState<string>('');
    const [currentAPIKey, setCurrentAPIKey] = useState<string>('');
    const [currentUsername, setCurrentUsername] = useState<string>('');
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [configFiles, setConfigFiles] = useState<SIEMConfigFile[]>([]);
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
            if (file.file) {
                triggerDownload(file.file, file.filename || file.file.name);
                return;
            }

            if (typeof file.content === 'string' && file.filename) {
                triggerDownload(new Blob([file.content], { type: 'text/plain' }), file.filename);
            }
        } finally {
            setDownloadingIndex(null);
        }
    };

    return (
        <>
            <DialogTitle id="alert-dialog-title">Add new SIEM Information</DialogTitle>
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
                    value={currentType}
                    onChange={(e: SelectChangeEvent<string>) =>
                        setCurrentType(e.target.value)
                    }
                    fullWidth
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
                    value={useAPIKey.toString()}
                    onChange={(e: SelectChangeEvent<string>) =>
                        setUseAPIKey(e.target.value === 'true')
                    }
                    fullWidth
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
                                    {file.filename || 'No file selected'}
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
                                    disabled={
                                        downloadingIndex === i ||
                                        (!file.file && !(typeof file.content === 'string' && !!file.filename))
                                    }
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
                    onClick={async () => {
                        setIsSaving(true);
                        try {
                            await Promise.resolve(
                                onCreate({
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
                    color="info"
                    disabled={!isValidURL(currentURL) || isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </>
    );
};
