import { useEffect, useState } from "react";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, Typography } from "@mui/material";
import { Helmet } from "react-helmet";

export const Organizations = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const [targetSOAR, setTargetSOAR] = useState(() => {
        const saved = localStorage.getItem("targetSOAR");
        const initialValue = JSON.parse(saved);
        return initialValue || null;
    });

    const getOrganizations = async () => {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/get_organizations/?soar_id=${targetSOAR.id}`);
        const rawData = await response.json();
        if (rawData["error"]) {
            setErrorMessage(rawData["error"])
        } else {
            setErrorMessage("")
        }
    }

    useEffect(() => {
        if (!targetSOAR) {
            return;
        }

        getOrganizations();
    }, [targetSOAR]);
    return (
        <>
            <Helmet>
                <title>Organizations</title>
            </Helmet>
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar title="Organizations" />
                <VerticalNavbar />
                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                    {
                        targetSOAR ? (
                            errorMessage.length > 0 ? (
                                <Typography variant="body1">{errorMessage}</Typography>
                            ) : (
                                <Typography variant="body1">Development in progress</Typography>
                            )
                        ) : (
                            <Typography variant="body1">You haven"t select your target SOAR platform yet. Please select your target SOAR platform in settings.</Typography>
                        )
                    }

                </Box>
            </Box>
        </>
    )
}