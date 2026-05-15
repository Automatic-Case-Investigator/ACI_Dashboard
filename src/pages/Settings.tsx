import { SOARSettings } from "../components/settings/SOARSettings/SOARSettings";
import { SIEMSettings } from "../components/settings/SIEMSettings/SIEMSettings";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Helmet } from "react-helmet";
import { Box } from "@mui/material";
import { AgentSettings } from "../components/settings/AgentSettings/AgentSettings";
import { WorkflowSettings } from "../components/settings/WorkflowSettings/WorkflowSettings";

export const Settings = () => {
    return (
        <>
            <Helmet>
                <title>Settings</title>
            </Helmet>
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar names={["Settings"]} routes={["/settings"]} />
                <VerticalNavbar />
                <Box component="main" sx={{ flexGrow: 1, minWidth: 0, width: '100%', p: { xs: 1, sm: 2 }, mt: { xs: 5, sm: 5.5 }, overflow: 'auto' }}>
                    <SOARSettings />
                    <Box sx={{ m: 2 }} />
                    <SIEMSettings />
                    <Box sx={{ m: 2 }} />
                    <AgentSettings />
                    <Box sx={{ m: 2 }} />
                    <WorkflowSettings />
                </Box>
            </Box>
        </>
    )
}