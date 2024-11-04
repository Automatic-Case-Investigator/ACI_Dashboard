
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, Typography } from "@mui/material";
import { SOARSettings } from "../components/settings/SOARSettings/SOARSettings";

export const Settings = () => {
    return (
        <Box sx={{ display: "flex" }}>
            <HorizontalNavbar />
            <VerticalNavbar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Typography variant="h4">Settings</Typography>
                <SOARSettings />
                <Typography variant="h6">SIEM</Typography>
            </Box>
        </Box>
    )
}