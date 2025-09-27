import {
    Box,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Pagination,
    Select,
    SelectChangeEvent,
    TextField,
    Typography
} from "@mui/material";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { CaseData, TargetSOARInfo } from "../types/types";
import { useNavigate, useParams } from "react-router-dom";
import { CASE_PAGE_SIZE } from "../constants/page-sizes";
import SearchIcon from '@mui/icons-material/Search';
import PuffLoader from "react-spinners/PuffLoader"
import WorkIcon from '@mui/icons-material/Work';
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useCookies } from "react-cookie";
import { debounce } from "lodash";

// Sort type labels for dropdown
const sortTypeMap: Record<string, string> = {
    "0": "Creation Time Z-A", // descending
    "1": "Creation Time A-Z", // ascending
}

export const Cases = () => {
    const { orgId } = useParams<{ orgId: string }>();
    const navigate = useNavigate();

    const [cookies, , removeCookies] = useCookies(["token"]);
    const [cases, setCases] = useState<CaseData[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pagesTotal, setPagesTotal] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [searchString, setSearchString] = useState<string>("");
    const [sortType, setSortType] = useState<string>("0");

    // Load target SOAR platform from local storage
    const [targetSOAR, _setTargetSOAR] = useState<TargetSOARInfo | null>(() => {
        const saved = localStorage.getItem("targetSOAR");
        return saved ? JSON.parse(saved) : null;
    });

    // Fetch list of cases from backend
    const getCases = async () => {
        if (!targetSOAR) return;
        
        setLoading(true);
        let queryURL = process.env.REACT_APP_BACKEND_URL + `soar/case/?soar_id=${targetSOAR.id}&org_id=${orgId}&page=${pageNumber}`;
        if (searchString.length > 0) {
            queryURL += `&search=${encodeURIComponent(searchString)}`;
        }
        queryURL += `&time_sort_type=${sortType}`;

        try {
            const response = await fetch(queryURL, {
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                }
            });

            const rawData = await response.json();

            // Handle token expiration
            if (rawData.code === "token_not_valid") {
                removeCookies("token");
                return;
            }

            if (rawData.error) {
                setErrorMessage(rawData.error);
            } else {
                setErrorMessage("");
                setCases(rawData.cases || []);

                // Compute total pages
                const entriesRemaining = rawData.total_count % CASE_PAGE_SIZE;
                setPagesTotal(Math.floor(rawData.total_count / CASE_PAGE_SIZE) + (entriesRemaining ? 1 : 0));
            }
        } catch (error) {
            setErrorMessage("Failed to fetch cases");
            console.error("Error fetching cases:", error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedGetCases = debounce(getCases, 500);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchString(e.target.value);
    };

    const handleSortChange = (e: SelectChangeEvent<string>) => {
        setSortType(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            getCases();
        }
    };

    useEffect(() => {
        if (!targetSOAR) return;
        getCases();
    }, [targetSOAR, pageNumber, sortType]);

    useEffect(() => {
        if (!targetSOAR) return;

        debouncedGetCases();
        return () => debouncedGetCases.cancel();
    }, [searchString]);

    return (
        <>
            <Helmet>
                <title>Cases</title>
            </Helmet>

            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar
                    names={["Organizations", `${orgId}`, "cases"]}
                    routes={["/organizations", `/organizations/${orgId}/cases`, `/organizations/${orgId}/cases`]}
                />
                <VerticalNavbar />

                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5 }}>
                    {/* Search and Sort Controls */}
                    <Box sx={{ width: "100%", display: "flex" }}>
                        <TextField
                            size="small"
                            placeholder="Search for case title"
                            value={searchString}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            sx={{ marginRight: 1 }}
                            fullWidth
                        />
                        <Select
                            size="small"
                            value={sortType}
                            onChange={handleSortChange}
                            sx={{ width: 200 }}
                        >
                            {Object.keys(sortTypeMap).map((key) => (
                                <MenuItem key={key} value={key}>
                                    {sortTypeMap[key]}
                                </MenuItem>
                            ))}
                        </Select>
                        <IconButton onClick={getCases}>
                            <SearchIcon />
                        </IconButton>
                    </Box>

                    {targetSOAR ? (
                        errorMessage ? (
                            <Typography variant="body1">{errorMessage}</Typography>
                        ) : (
                            <>
                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <PuffLoader color="#00ffea" />
                                    </Box>
                                ) : (
                                    <>
                                        {cases.length > 0 ? (
                                            <List>
                                                {cases.map((case_data) => (
                                                    <ListItem
                                                        key={case_data.id}
                                                        sx={{ display: "block", cursor: 'pointer' }}
                                                        onClick={() => navigate(`/organizations/${orgId}/cases/${case_data.id}`)}
                                                    >
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
                                                            secondary={`ID: ${case_data.id}`}
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
                                                            secondary={`Description: ${case_data.description}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography
                                                color="textSecondary"
                                                sx={{ padding: 1, fontStyle: "italic" }}
                                            >
                                                Cannot find cases in the SOAR platform
                                            </Typography>
                                        )}
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Pagination
                                                color="secondary"
                                                sx={{ paddingBottom: 1 }}
                                                count={pagesTotal}
                                                page={pageNumber}
                                                onChange={(_, value) => setPageNumber(value)}
                                            />
                                        </Box>
                                    </>
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
    );
};