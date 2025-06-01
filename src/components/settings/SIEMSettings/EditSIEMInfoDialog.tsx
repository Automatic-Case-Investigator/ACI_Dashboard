import {
    Button,
    MenuItem,
    Select,
    TextField,
    Typography,
    DialogActions,
    DialogContent,
    DialogTitle,
    SelectChangeEvent,
} from '@mui/material';
import React, { useState } from 'react';
import { SIEM_CHOICES } from '../../../constants/platform-choices';
import { CallbackFunction, SIEMData } from '../../../types/types';

const isValidURL = (url: string): boolean => {
    const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return urlPattern.test(url);
};

interface EditSIEMInfoDialogProps {
    selectedSiemData?: SIEMData;
    onClose: CallbackFunction;
    onSave: CallbackFunction;
}

export const EditSIEMInfoDialog: React.FC<EditSIEMInfoDialogProps> = ({
    selectedSiemData,
    onClose,
    onSave,
}) => {
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
            </DialogContent>
            <DialogActions>
                <Button color="warning" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    color="info"
                    onClick={() => {
                        onSave({
                            id: selectedSiemData?.id ?? -1,
                            name: currentName,
                            type: currentType,
                            url: currentURL,
                            useAPIKey,
                            apiKey: currentAPIKey,
                            username: currentUsername,
                            password: currentPassword,
                        });
                        onClose();
                    }}
                    autoFocus
                    disabled={!isValidURL(currentURL)}
                >
                    Save
                </Button>
            </DialogActions>
        </>
    );
};
