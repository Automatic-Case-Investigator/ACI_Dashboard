import { Box, IconButton, Tooltip, Typography, TextField, MenuItem, Select, InputLabel, FormControl, Paper, Button } from "@mui/material";
import { useEffect, useState } from "react";
import RefreshIcon from '@mui/icons-material/Refresh';
import { useCookies } from "react-cookie";

interface ConnectionResponse {
    code?: string;
    error?: string;
    connected?: boolean;
}

export const AgentSettings = () => {
    const [cookies, , removeCookies] = useCookies(["token"]);
    const [AIBackendConnected, setAIBackendConnected] = useState<boolean>(false);

    // Separate state for magnitude and units
    const [earliestMagnitude, setEarliestMagnitude] = useState<number | "">("");
    const [earliestUnit, setEarliestUnit] = useState<string>("hours");

    const testAIBackendConnection = async () => {
        const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}ai_backend/status/`,
            {
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                }
            }
        );
        const responseJson: ConnectionResponse = await response.json();

        if (responseJson.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        setAIBackendConnected(responseJson.connected ?? false);
    };

    const refresh = async () => {
        testAIBackendConnection();
    };

    useEffect(() => {
        testAIBackendConnection();
    }, []);

    return (
        <Box mb={2}>
            <Typography variant="h6">Agent Settings</Typography>

            <Paper sx={{ p: 2, mt: 1 }}>
                <Box mb={2} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography sx={{ marginRight: 1 }}>AI Backend Status:</Typography>
                        <Typography sx={{ color: AIBackendConnected ? "success.main" : "error.main" }}>
                            {AIBackendConnected ? "Connected" : "Disconnected"}
                        </Typography>
                    </Box>

                    <Tooltip title="Refresh">
                        <IconButton onClick={refresh}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Typography mb={1}>Earliest events to look up:</Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
                    <TextField
                        size="small"
                        type="number"
                        placeholder="0"
                        value={earliestMagnitude}
                        onChange={(e) => setEarliestMagnitude(e.target.value === "" ? "" : Number(e.target.value))}
                        sx={{ width: 100 }}
                    />

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Unit</InputLabel>
                        <Select
                            value={earliestUnit}
                            label="Unit"
                            onChange={(e) => setEarliestUnit(e.target.value)}
                        >
                            <MenuItem value="hours">Hours</MenuItem>
                            <MenuItem value="days">Days</MenuItem>
                            <MenuItem value="years">Years</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Button
                        color="secondary"
                        variant="outlined"
                        onClick={() => {
                            console.log(`Saving settings: ${earliestMagnitude} ${earliestUnit}`);
                        }}
                    >
                        Save
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};