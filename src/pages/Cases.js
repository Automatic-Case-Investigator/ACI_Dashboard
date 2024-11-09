import { Helmet } from "react-helmet";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import WorkIcon from '@mui/icons-material/Work';
import PuffLoader from "react-spinners/PuffLoader"
import { useEffect, useState } from "react";

export const Cases = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState("");
    const [cases, setCases] = useState([]);
    const [targetSOAR, setTargetSOAR] = useState(() => {
        const saved = localStorage.getItem("targetSOAR");
        const initialValue = JSON.parse(saved);
        return initialValue || null;
    });

    const getCases = async () => {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/get_cases/?soar_id=${targetSOAR.id}&org_id=${orgId}`);
        const rawData = await response.json();

        if (rawData["error"]) {
            setErrorMessage(rawData["error"])
        } else {
            setErrorMessage("")
            setCases(rawData["cases"])
        }
    }

    useEffect(() => {
        if (!targetSOAR) {
            return;
        }

        getCases();
    }, [targetSOAR]);

    return (
        <>
            <Helmet>
                <title>Cases</title>
            </Helmet>
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar title={`Organizations/${orgId}/cases`} />
                <VerticalNavbar />
                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                    {
                        targetSOAR ? (
                            errorMessage.length > 0 ? (
                                <Typography variant="body1">{errorMessage}</Typography>
                            ) : (
                                <>
                                    {
                                        cases.length === 0 ? (
                                            <PuffLoader color="#00ffea" />
                                        ) : (
                                            <List>
                                                {
                                                    cases.map((case_data, index) => (
                                                        <ListItem key={index} sx={{ display: "block" }} onClick={() => { navigate(`/organizations/${orgId}/cases/${case_data._id}`) }}>
                                                            <ListItemIcon sx={{ display: "inline-block", verticalAlign: "middle" }}>
                                                                <WorkIcon />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                sx={{ display: "inline-block", verticalAlign: "middle" }}
                                                                primaryTypographyProps={{
                                                                    sx: {
                                                                        width: "calc(40vw - 150px)",
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                    },
                                                                }}
                                                                primary={case_data.title}
                                                                secondary={`ID: ${case_data._id}`} />
                                                            <ListItemText
                                                                sx={{ display: "inline-block", verticalAlign: "middle", marginLeft: 10 }}
                                                                secondaryTypographyProps={{
                                                                    sx: {
                                                                        width: "calc(60vw - 150px)",
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                    },
                                                                }}
                                                                secondary={`Description: ${case_data.description}`} />
                                                        </ListItem>
                                                    ))
                                                }
                                            </List>
                                        )
                                    }

                                </>
                            )
                        ) : (
                            <Typography variant="body1">You haven't select your target SOAR platform yet. Please select your target SOAR platform in settings.</Typography>
                        )
                    }
                </Box>
            </Box>
        </>
    )
}