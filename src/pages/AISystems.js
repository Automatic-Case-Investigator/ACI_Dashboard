import { Helmet } from "react-helmet";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { TaskGenerationTrainerDashboard } from "../components/ai_system_dashboard/TaskGenerationTrainerDashboard";
import { useEffect, useState } from "react";
import RefreshIcon from '@mui/icons-material/Refresh';


export const AISystems = () => {
    const [AIBackendConnected, setAIBackendConnected] = useState(false);
    const testAIBackendConnection = async () => {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + `ai_backend/status/`)
        setAIBackendConnected((await response.json()).connected);
    }

    const refresh = async () => {
        testAIBackendConnection();
    }

    useEffect(() => {
        testAIBackendConnection();
    }, []);

    return (
        <>
            <Helmet>
                <title>AI Systems</title>
            </Helmet>
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar names={["AI Systems"]} routes={["/ai-systems"]} />
                <VerticalNavbar />
                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                    <Box sx={{marginBottom: 1}}>
                        <Typography sx={{ display: "inline-block", marginRight: 1 }}>AI Backend Status: </Typography>
                        <Typography sx={{ display: "inline-block", color: AIBackendConnected ? "success.main" : "error.main" }}>{AIBackendConnected ? "Connected" : "Disconnected"}</Typography>
                        <Tooltip title="Refresh">
                            <IconButton sx={{ float: "right" }} onClick={refresh}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <TaskGenerationTrainerDashboard />
                </Box>
            </Box>
        </>
    )
}