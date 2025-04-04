import { Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { SIEM_CHOICES } from '../../../constants/platform-choices';

const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

export const NewSIEMInfoDialog = ({ onClose, onCreate }) => {
    const [currentName, setCurrentName] = useState("");
    const [currentType, setCurrentType] = useState(Object.values(SIEM_CHOICES)[0]);
    const [useAPIKey, setUseAPIKey] = useState(false);
    const [currentURL, setCurrentURL] = useState("");
    const [currentAPIKey, setCurrentAPIKey] = useState("");
    const [currentUsername, setCurrentUsername] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");

    return (
        <>
            <DialogTitle id="alert-dialog-title">
                Add new SIEM Information
            </DialogTitle>
            <DialogContent>
                <Typography>Name</Typography>
                <TextField size="small" fullWidth value={currentName} onInput={(e) => { setCurrentName(e.target.value) }}></TextField>
                <Typography>Type</Typography>
                <Select size="small" value={currentType} onChange={(e) => { setCurrentType(e.target.value) }} fullWidth>
                    {
                        Object.values(SIEM_CHOICES).map((siemType) => {
                            return <MenuItem value={siemType}>{siemType}</MenuItem>
                        })
                    }
                </Select>
                <Typography>URL</Typography>
                <TextField size="small" fullWidth type="url" value={currentURL} onInput={(e) => { setCurrentURL(e.target.value) }}></TextField>
                {
                    !urlPattern.test(currentURL) && <Typography color="error.main">Invalid URL</Typography>
                }

                <Typography>Authentication Type</Typography>
                <Select size="small" value={useAPIKey} onChange={(e) => { setUseAPIKey(e.target.value) }} fullWidth>
                    <MenuItem value={true}>API Key</MenuItem>
                    <MenuItem value={false}>Username / Password</MenuItem>
                </Select>
                {
                    useAPIKey ? (
                        <>
                            <Typography>API Key</Typography>
                            <TextField size="small" fullWidth value={currentAPIKey} onInput={(e) => { setCurrentAPIKey(e.target.value) }}></TextField>
                        </>
                    ) : (
                        <>
                            <Typography>Username</Typography>
                            <TextField size="small" fullWidth value={currentUsername} onInput={(e) => { setCurrentUsername(e.target.value) }}></TextField>
                            <Typography>Password</Typography>
                            <TextField type="password" size="small" fullWidth value={currentPassword} onInput={(e) => { setCurrentPassword(e.target.value) }}></TextField>
                        </>
                    )
                }
            </DialogContent>
            <DialogActions>
                <Button color="warning" onClick={onClose}>Cancel</Button>
                <Button onClick={() => {
                    onCreate({
                        name: currentName,
                        type: currentType,
                        url: currentURL,
                        useAPIKey: useAPIKey,
                        apiKey: currentAPIKey,
                        username: currentUsername,
                        password: currentPassword
                    });
                    onClose()
                }} autoFocus color="info" disabled={!urlPattern.test(currentURL)}>Save</Button>
            </DialogActions>
        </>
    );
}