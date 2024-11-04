import { Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { SOAR_CHOICES } from '../../../constants/platform-choices';

const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

export const NewSOARInfoDialog = ({ onClose, onCreate }) => {
    const [currentName, setCurrentName] = useState("");
    const [currentType, setCurrentType] = useState(Object.values(SOAR_CHOICES)[0]);
    const [currentURL, setCurrentURL] = useState("");
    const [currentAPIKey, setCurrentAPIKey] = useState("");
    return (
        <>
            <DialogTitle id="alert-dialog-title">
                Add new SOAR Information
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
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={() => {
                    onCreate({
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