import { Box, Button, Modal, Paper, TextField, Typography } from "@mui/material"
import { useState } from "react";

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
                    <TextField label="Old Username" fullWidth />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <TextField label="Old Password" fullWidth />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <TextField label="New Username" fullWidth />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <TextField label="New Password" fullWidth />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Button variant="outlined">Update</Button>
                </Box>

            </Box>
        </Modal>
    )
}