import { Helmet } from "react-helmet";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box } from "@mui/material";
import { TaskGenerationTrainerDashboard } from "../components/ai_system_dashboard/TaskGenerationTrainerDashboard";

export const AISystems = () => {
    return (
        <>
            <Helmet>
                <title>AI Systems</title>
            </Helmet>
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar names={["AI Systems"]} routes={["/ai-systems"]} />
                <VerticalNavbar />
                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                    <TaskGenerationTrainerDashboard />
                </Box>
            </Box>
        </>
    )
}