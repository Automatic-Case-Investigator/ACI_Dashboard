import { Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { SIEM_CHOICES } from '../../../constants/platform-choices';

const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

export const EditSIEMInfoDialog = ({ selectedSiemData, onClose, onSave }) => {
    const [currentName, setCurrentName] = useState(selectedSiemData ? selectedSiemData.name : "");
    const [currentType, setCurrentType] = useState(selectedSiemData ? selectedSiemData.type : "");
    const [currentURL, setCurrentURL] = useState(selectedSiemData ? selectedSiemData.url : "");
    const [currentAPIKey, setCurrentAPIKey] = useState(selectedSiemData ? selectedSiemData.apiKey : "");
    const [useAPIKey, setUseAPIKey] = useState(selectedSiemData ? selectedSiemData.useAPIKey : false);
    const [currentUsername, setCurrentUsername] = useState(selectedSiemData ? selectedSiemData.username : "");
    const [currentPassword, setCurrentPassword] = useState(selectedSiemData ? selectedSiemData.password : "");

    return (
        <>
            <DialogTitle id="alert-dialog-title">
                Edit SIEM Information
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
                <Button color="info" onClick={() => {
                    onSave({
                        id: selectedSiemData ? selectedSiemData.id : -1,
                        name: currentName,
                        type: currentType,
                        url: currentURL,
                        useAPIKey: useAPIKey,
                        apiKey: currentAPIKey,
                        username: currentUsername,
                        password: currentPassword
                    });
                    onClose()
                }} autoFocus disabled={!urlPattern.test(currentURL)}>Save</Button>
            </DialogActions>
        </>
    );
}