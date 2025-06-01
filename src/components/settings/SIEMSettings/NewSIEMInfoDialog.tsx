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
import { CallbackFunction } from '../../../types/types';

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
            </DialogContent>

            <DialogActions>
                <Button color="warning" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={() => {
                        onCreate({
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
                    color="info"
                    disabled={!isValidURL(currentURL)}
                >
                    Save
                </Button>
            </DialogActions>
        </>
    );
};
