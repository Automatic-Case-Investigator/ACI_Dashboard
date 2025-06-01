import { Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useState } from 'react';
import { SOAR_CHOICES } from '../../../constants/platform-choices';
import { CallbackFunction, SOARData } from '../../../types/types';

const isValidURL = (url: string): boolean => {
    const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return urlPattern.test(url);
};

interface EditSOARInfoDialogProps {
    selectedSoarData?: SOARData;
    onClose: CallbackFunction;
    onSave: CallbackFunction;
}

export const EditSOARInfoDialog: React.FC<EditSOARInfoDialogProps> = ({ selectedSoarData, onClose, onSave }) => {
    const [currentName, setCurrentName] = useState<string>(selectedSoarData ? selectedSoarData.name : "");
    const [currentType, setCurrentType] = useState<string>(selectedSoarData ? selectedSoarData.type : "");
    const [currentURL, setCurrentURL] = useState<string>(selectedSoarData ? selectedSoarData.url : "");
    const [currentAPIKey, setCurrentAPIKey] = useState<string>(selectedSoarData ? selectedSoarData.apiKey : "");

    return (
        <>
            <DialogTitle id="alert-dialog-title">
                Edit SOAR Information
            </DialogTitle>
            <DialogContent>
                <Typography>Name</Typography>
                <TextField size="small" fullWidth value={currentName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCurrentName(e.target.value) }}></TextField>
                <Typography>Type</Typography>
                <Select size="small" value={currentType} onChange={(e) => { setCurrentType(e.target.value) }} fullWidth>
                    {
                        Object.values(SOAR_CHOICES).map((soarType) => {
                            return <MenuItem value={soarType}>{soarType}</MenuItem>
                        })
                    }
                </Select>
                <Typography>URL</Typography>
                <TextField size="small" fullWidth type="url" value={currentURL} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCurrentURL(e.target.value) }}></TextField>
                {
                    !isValidURL(currentURL) && <Typography color="error.main">Invalid URL</Typography>
                }
                <Typography>API Key</Typography>
                <TextField size="small" fullWidth value={currentAPIKey} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCurrentAPIKey(e.target.value) }}></TextField>
            </DialogContent>
            <DialogActions>
                <Button color="warning" onClick={onClose}>Cancel</Button>
                <Button color="info" onClick={() => {
                    onSave({
                        id: selectedSoarData ? selectedSoarData.id : -1,
                        name: currentName,
                        type: currentType,
                        url: currentURL,
                        apiKey: currentAPIKey
                    });
                    onClose()
                }} autoFocus disabled={!isValidURL(currentURL)}>Save</Button>
            </DialogActions>
        </>
    );
}