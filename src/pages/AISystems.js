import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, Typography } from "@mui/material";

export const AISystems = () => {
    return (
        <Box sx={{ display: "flex" }}>
            <HorizontalNavbar title="AI Systems"/>
            <VerticalNavbar />
            <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                <Typography variant="body1">Development in progress</Typography>
            </Box>
        </Box>
    )
}