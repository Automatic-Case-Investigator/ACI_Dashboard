import { Box, IconButton, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, OutlinedInput, Pagination, Select, TextField, Typography } from "@mui/material";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { useNavigate, useParams } from "react-router-dom";
import { CASE_PAGE_SIZE } from "../constants/page-sizes";
import SearchIcon from '@mui/icons-material/Search';
import PuffLoader from "react-spinners/PuffLoader"
import WorkIcon from '@mui/icons-material/Work';
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useCookies } from "react-cookie";

const sortTypeMap = {
    0: "Creation Time Z-A", // descending order of creation time
    1: "Creation Time A-Z", // ascending order of creation time
}

export const Cases = () => {
    const { orgId } = useParams();
    const navigate = useNavigate();

    const [cookies, setCookies, removeCookies] = useCookies(["token"]);
    const [cases, setCases] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pagesTotal, setPagesTotal] = useState(1);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchString, setSearchString] = useState("");
    const [sortType, setSortType] = useState(Object.keys(sortTypeMap)[0]);
    const [targetSOAR, setTargetSOAR] = useState(() => {
        const saved = localStorage.getItem("targetSOAR");
        const initialValue = JSON.parse(saved);
        return initialValue || null;
    });

    // obtain a list of cases from the backend
    const getCases = async () => {
        setLoading(true);
        let queryURL = process.env.REACT_APP_BACKEND_URL + `soar/case/?soar_id=${targetSOAR.id}&org_id=${orgId}&page=${pageNumber}`;
        if (searchString.length > 0) {
            queryURL += `&search=${searchString}`;
        }
        queryURL += `&time_sort_type=${sortType}`;
        const response = await fetch(
            queryURL,
            {
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                }
            }
        );
        const rawData = await response.json();
        
        if (rawData.code && rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        if (rawData["error"]) {
            setErrorMessage(rawData["error"])
        } else {
            setErrorMessage("")
            setCases(rawData["cases"])

            const entriesRemaining = rawData["total_count"] % CASE_PAGE_SIZE;
            if (entriesRemaining) {
                setPagesTotal(Math.floor(rawData["total_count"] / CASE_PAGE_SIZE) + 1)
            } else {
                setPagesTotal(Math.floor(rawData["total_count"] / CASE_PAGE_SIZE))
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        if (!targetSOAR) {
            return;
        }
        getCases();
    }, [targetSOAR, pageNumber]);

    return (
        <>
            <Helmet>
                <title>Cases</title>
            </Helmet>
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar
                    names={["Organizations", `${orgId}`, "cases"]}
                    routes={["/organizations", `/organizations/${orgId}/cases`, `/organizations/${orgId}/cases`]} />
                <VerticalNavbar />
                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                    <Box sx={{ width: "100%", display: "flex" }}>
                        <TextField
                            size="small"
                            placeholder="Search for case title"
                            value={searchString}
                            onInput={(e) => setSearchString(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    getCases();
                                }
                            }}
                            sx={{ marginRight: 1 }}
                            fullWidth />
                        <Select
                            size="small"
                            value={sortType}
                            onChange={(e) => setSortType(e.target.value)}
                            sx={{ width: 200 }}>
                            {
                                Object.keys(sortTypeMap).map((key, _) => (
                                    <MenuItem key={key} value={key}>
                                        {sortTypeMap[key]}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                        <IconButton onClick={getCases}>
                            <SearchIcon />
                        </IconButton>
                    </Box>
                    {
                        targetSOAR ? (
                            errorMessage.length > 0 ? (
                                <Typography variant="body1">{errorMessage}</Typography>
                            ) : (
                                <>
                                    {
                                        loading ? (
                                            <PuffLoader color="#00ffea" />
                                        ) : (
                                            <>
                                                {
                                                    cases.length > 0 ? (
                                                        <List>
                                                            {
                                                                cases.map((case_data, index) => (
                                                                    <ListItem key={index} sx={{ display: "block" }} onClick={() => { navigate(`/organizations/${orgId}/cases/${case_data.id}`) }}>
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
                                                                            secondary={`ID: ${case_data.id}`} />
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
                                                    ) : (
                                                        <Typography color="weak" sx={{ padding: 1, fontStyle: "italic" }}>Cannot find cases in the SOAR platform</Typography>
                                                    )
                                                }
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Pagination color="secondary" sx={{ paddingBottom: 1 }} count={pagesTotal} page={pageNumber} onChange={(_, value) => { setPageNumber(value) }} />
                                                </Box>
                                            </>
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