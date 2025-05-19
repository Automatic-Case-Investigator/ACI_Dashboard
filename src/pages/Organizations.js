import { useEffect, useState } from "react";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography
} from "@mui/material";
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import { Helmet } from "react-helmet";
import PuffLoader from "react-spinners/PuffLoader"
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

export const Organizations = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const [organizations, setOrganizations] = useState([]);
    const [cookies, , removeCookies] = useCookies(["token"]);

    // Load selected SOAR platform from localStorage
    const [targetSOAR, setTargetSOAR] = useState(() => {
        const saved = localStorage.getItem("targetSOAR");
        const initialValue = JSON.parse(saved);
        return initialValue || null;
    });

    const navigate = useNavigate();

    // Fetch organizations for the selected SOAR platform
    const getOrganizations = async () => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `soar/organizations/?soar_id=${targetSOAR.id}`,
            {
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                }
            }
        );
        const rawData = await response.json();

        if (rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        if (rawData.error) {
            setErrorMessage(rawData.error);
        } else {
            setErrorMessage("");
            setOrganizations(rawData.organizations);
        }
    }

    useEffect(() => {
        if (!targetSOAR) return;
        getOrganizations();
    }, [targetSOAR]);

    return (
        <>
            <Helmet>
                <title>Organizations</title>
            </Helmet>

            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar names={["Organizations"]} routes={["/organizations"]} />
                <VerticalNavbar />
                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                    {targetSOAR ? (
                        errorMessage ? (
                            <Typography variant="body1">{errorMessage}</Typography>
                        ) : (
                            <>
                                {organizations.length === 0 ? (
                                    <PuffLoader color="#00ffea" />
                                ) : (
                                    <List>
                                        {organizations.map((org, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{ display: "block" }}
                                                onClick={() => navigate(`/organizations/${org.id}/cases`)}
                                            >
                                                <ListItemIcon sx={{ display: "inline-block", verticalAlign: "middle" }}>
                                                    <CorporateFareIcon />
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
                                                    primary={org.name}
                                                    secondary={`ID: ${org.id}`}
                                                />
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
                                                    secondary={`Description: ${org.description}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </>
                        )
                    ) : (
                        <Typography variant="body1">
                            You haven't selected your target SOAR platform yet. Please select your target SOAR platform in settings.
                        </Typography>
                    )}
                </Box>
            </Box>
        </>
    )
}
