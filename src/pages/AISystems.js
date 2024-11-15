import { Helmet } from "react-helmet";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, Typography } from "@mui/material";

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
                    <Typography variant="body1">Development in progress</Typography>
                </Box>
            </Box>
        </>
    )
}