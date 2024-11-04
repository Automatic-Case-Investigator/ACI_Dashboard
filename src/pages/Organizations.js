import { useState } from "react";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, Typography } from "@mui/material";

export const Organizations = () => {
    const [targetSOAR, setTargetSOAR] = useState(() => {
        const saved = localStorage.getItem("targetSOAR");
        const initialValue = JSON.parse(saved);
        return initialValue || null;
    })
    return (
        <Box sx={{ display: "flex" }}>
            <HorizontalNavbar title="Organizations"/>
            <VerticalNavbar />
            <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                {
                    targetSOAR ? (
                        <Typography variant="body1">Development in progress</Typography>
                    ) : (
                        <Typography variant="body1">You haven"t select your target SOAR platform yet. Please select your target SOAR platform in settings.</Typography>
                    )
                }
                
            </Box>
        </Box>
    )
}