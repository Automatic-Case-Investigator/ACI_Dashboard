import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Helmet } from "react-helmet";
import {
    Box,
    Typography,
    IconButton,
    Divider,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import PuffLoader from "react-spinners/PuffLoader";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { SIEMQueryAgent } from "../components/case_page/siem_query_agent/SIEMQueryAgent";
import { DocumentData } from "../types/types";
import { darkTheme } from "../themes/darkTheme";

export const DocumentPage = () => {
    const { orgId, caseId, documentId } = useParams<{ orgId: string; caseId: string; documentId: string }>();

    const [cookies, , removeCookies] = useCookies(["token"]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [documentData, setDocumentData] = useState<DocumentData | null>(null);
    const [targetSOAR, _setTargetSOAR] = useState<{ id: string } | null>(() => {
        try {
            const saved = localStorage.getItem("targetSOAR");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const navigate = useNavigate();

    const getDocumentData = async () => {
        const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}soar/case_document/?soar_id=${targetSOAR?.id}&org_id=${orgId}&case_id=${caseId}&document_id=${documentId}`,
            {
                headers: {
                    Authorization: `Bearer ${cookies.token}`,
                },
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
            setDocumentData(rawData.pages[0]);
        }
    };

    useEffect(() => {
        if (!targetSOAR) {
            return;
        }

        getDocumentData();
    }, [targetSOAR]);

    return (
        <>
            {documentData && (
                <Helmet>
                    <title>{documentData.title}</title>
                </Helmet>
            )}
            <Box sx={{ display: "flex", minHeight: "100dvh" }}>
                <HorizontalNavbar
                    names={[
                        "Organizations",
                        `${orgId}`,
                        "cases",
                        `${caseId}`,
                        "documents",
                        `${documentId}`
                    ]}
                    routes={[
                        "/organizations",
                        `/organizations/${orgId}/cases`,
                        `/organizations/${orgId}/cases`,
                        `/organizations/${orgId}/cases/${caseId}`,
                        `/organizations/${orgId}/cases/${caseId}`,
                        `/organizations/${orgId}/cases/${caseId}/documents/${documentId}`
                    ]}
                />
                <VerticalNavbar />
                <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 1, sm: 2 }, mt: { xs: 5, sm: 5.5 }, minHeight: 0, overflow: "auto", display: 'flex', flexDirection: 'column' }}>
                    {targetSOAR ? (
                        errorMessage.length > 0 ? (
                            <Typography variant="body1">{errorMessage}</Typography>
                        ) : (
                            <>
                                {documentData ? (
                                    <>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <IconButton
                                                size="small"
                                                edge="start"
                                                onClick={() => navigate(-1)}
                                                sx={{ mr: 1 }}
                                            >
                                                <ArrowBackIosIcon fontSize="small" />
                                            </IconButton>
                                            <Typography variant="h6">{documentData.title}</Typography>
                                        </Box>
                                        <Box sx={{ flexDirection: 'row' }}>
                                            <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>ID:</b></Typography>
                                            <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{documentData.id}</Typography>
                                            <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>Created At:</b></Typography>
                                            <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{new Date(documentData.createdAt).toString()}</Typography>
                                            <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>Created By:</b></Typography>
                                            <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{documentData.createdBy}</Typography>
                                            <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>Category:</b></Typography>
                                            <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{documentData.category}</Typography>
                                            <Divider sx={{ paddingTop: 1, marginBottom: 1 }} />

                                            <Typography variant="h6">Content:</Typography>
                                            <Box sx={{ width: "100%", overflowX: "auto" }}>
                                                <MarkdownPreview source={documentData.content} style={{ width: "100%", background: "transparent", color: darkTheme.palette.primary.main, fontSize: "1rem" }} />
                                            </Box>
                                            <Divider sx={{ paddingTop: 1, marginBottom: 1 }} />
                                        </Box>
                                        <SIEMQueryAgent />
                                    </>
                                ) : (
                                    <PuffLoader color="#00ffea" />
                                )}
                            </>
                        )
                    ) : (
                        <Typography variant="body1">You haven't select your target SOAR platform yet. Please select your target SOAR platform in settings.</Typography>
                    )}
                </Box>
            </Box>
        </>
    );
};