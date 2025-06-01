import React, { useState } from 'react';
import {
    Button,
    MenuItem,
    Select,
    TextField,
    Typography,
    DialogActions,
    DialogContent,
    DialogTitle,
    SelectChangeEvent
} from '@mui/material';

import { SOAR_CHOICES } from '../../../constants/platform-choices';
import { CallbackFunction } from '../../../types/types';

interface NewSOARInfoDialogProps {
    onClose: CallbackFunction;
    onCreate: CallbackFunction;
}

const isValidURL = (url: string): boolean => {
    const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return urlPattern.test(url);
};

export const NewSOARInfoDialog: React.FC<NewSOARInfoDialogProps> = ({ onClose, onCreate }) => {
    const [currentName, setCurrentName] = useState<string>('');
    const [currentType, setCurrentType] = useState<string>(Object.values(SOAR_CHOICES)[0]);
    const [currentURL, setCurrentURL] = useState<string>('');
    const [currentAPIKey, setCurrentAPIKey] = useState<string>('');

    return (
        <>
            <DialogTitle id="alert-dialog-title">Add new SOAR Information</DialogTitle>
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
                    onChange={(e: SelectChangeEvent<string>) =>
                        setCurrentType(e.target.value)
                    }
                >
                    {Object.values(SOAR_CHOICES).map((soarType) => (
                        <MenuItem key={soarType} value={soarType}>
                            {soarType}
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

                <Typography>API Key</Typography>
                <TextField
                    size="small"
                    fullWidth
                    value={currentAPIKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentAPIKey(e.target.value)
                    }
                />
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
                            apiKey: currentAPIKey,
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
