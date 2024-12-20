import { Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { SOAR_CHOICES } from '../../../constants/platform-choices';

const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

export const EditSOARInfoDialog = ({ selectedSoarData, onClose, onSave }) => {
    const [currentName, setCurrentName] = useState(selectedSoarData ? selectedSoarData.name : "");
    const [currentType, setCurrentType] = useState(selectedSoarData ? selectedSoarData.type : "");
    const [currentURL, setCurrentURL] = useState(selectedSoarData ? selectedSoarData.url : "");
    const [currentAPIKey, setCurrentAPIKey] = useState(selectedSoarData ? selectedSoarData.apiKey : "");
    return (
        <>
            <DialogTitle id="alert-dialog-title">
                Edit SOAR Information
            </DialogTitle>
            <DialogContent>
                <Typography>Name</Typography>
                <TextField fullWidth value={currentName} onInput={(e) => { setCurrentName(e.target.value) }}></TextField>
                <Typography>Type</Typography>
                <Select value={currentType} onChange={(e) => { setCurrentType(e.target.value) }} fullWidth>
                    {
                        Object.values(SOAR_CHOICES).map((soarType) => {
                            return <MenuItem value={soarType}>{soarType}</MenuItem>
                        })
                    }
                </Select>
                <Typography>URL</Typography>
                <TextField fullWidth type="url" value={currentURL} onInput={(e) => { setCurrentURL(e.target.value) }}></TextField>
                {
                    !urlPattern.test(currentURL) && <Typography color="error.main">Invalid URL</Typography>
                }
                <Typography>API Key</Typography>
                <TextField fullWidth value={currentAPIKey} onInput={(e) => { setCurrentAPIKey(e.target.value) }}></TextField>
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
                }} autoFocus disabled={!urlPattern.test(currentURL)}>Save</Button>
            </DialogActions>
        </>
    );
}