
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, Typography } from "@mui/material";
import { SOARSettings } from "../components/settings/SOARSettings/SOARSettings";

export const Settings = () => {
    return (
        <Box sx={{ display: "flex" }}>
            <HorizontalNavbar title="Settings"/>
            <VerticalNavbar />
            <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                <SOARSettings />
                <Typography variant="h6">SIEM</Typography>
            </Box>
        </Box>
    )
}