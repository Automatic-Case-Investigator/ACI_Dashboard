import { Box, Button, Modal, Paper, TextField, Typography } from "@mui/material"
import { useState } from "react";
import { useCookies } from "react-cookie";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "80%",
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

export const ResetCredentialsModal = ({ open, onClose }) => {
    const [cookies, setCookies, removeCookies] = useCookies(["token"]);
    const [oldPassword, setOldPassword] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [successful, setSuccessful] = useState(true);
    const [loading, setLoading] = useState(false);

    const updateCredentials = async () => {
        setLoading(true);
        setMessage("");

        const requestBody = new FormData();
        requestBody.append("old_password", oldPassword);
        requestBody.append("new_username", newUsername);
        requestBody.append("new_password", newPassword);

        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + "reset_credentials/",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                },
                body: requestBody
            }
        );
        const rawData = await response.json();

        // check for expired token
        if (rawData.code && rawData.code === "token_not_valid") {
            removeCookies("token");
            setLoading(false);
            return;
        }

        setSuccessful(!rawData["error"]);
        setMessage(rawData["error"] || rawData["message"]);

        if (rawData["access"]) {
            setCookies("token", rawData["access"], { path: "/" });
        }

        setLoading(false);
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <Box sx={style}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" component="h2">
                        Reset Credentials
                    </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <TextField type="password" label="Old Password" value={oldPassword} onChange={(e) => {setOldPassword(e.target.value)}} fullWidth />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <TextField label="New Username" value={newUsername} onChange={(e) => {setNewUsername(e.target.value)}} fullWidth />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <TextField type="password" label="New Password" value={newPassword} onChange={(e) => {setNewPassword(e.target.value)}} fullWidth />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Button variant="outlined" onClick={updateCredentials} loading={loading}>Update</Button>
                </Box>

                <Typography color={successful ? "success" : "error"}>{message}</Typography>
            </Box>
        </Modal>
    )
}