import { Helmet } from "react-helmet";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { TaskGenerationTrainerDashboard } from "../components/ai_system_dashboard/TaskGenerationTrainerDashboard";
import { useEffect, useState } from "react";
import RefreshIcon from '@mui/icons-material/Refresh';
import { ActivityGenerationTrainerDashboard } from "../components/ai_system_dashboard/ActivityGenerationTrainerDashboard";
import { QueryGenerationTrainerDashboard } from "../components/ai_system_dashboard/QueryGenerationTrainerDashboard";


export const AISystems = () => {
    const [AIBackendConnected, setAIBackendConnected] = useState(false);
    const [caseIds, setCaseIds] = useState([]);
    const [caseOrgIds, setCaseOrgIds] = useState({});
    const [caseDataForest, setCaseDataForest] = useState([]);

    const [targetSOAR, setTargetSOAR] = useState(() => {
        const saved = localStorage.getItem("targetSOAR");
        const initialValue = JSON.parse(saved);
        return initialValue || null;
    });


    const testAIBackendConnection = async () => {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + `ai_backend/status/`)
        setAIBackendConnected((await response.json()).connected);
    }

    const buildCaseDataForest = async () => {
        const orgsResponse = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/organizations/?soar_id=${targetSOAR.id}`);
        const orgsRawData = await orgsResponse.json();
        let updatedCaseDataForest = [];
        let fetchedCaseIds = [];
        let updatedCaseOrgIds = {};

        if (orgsRawData["error"]) {
            return;
        }

        for (let org of orgsRawData["organizations"]) {
            updatedCaseDataForest.push({
                id: org.id,
                label: `${org.name} (${org.id})`,
                children: [],
            });
            const casesResponse = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/case/?soar_id=${targetSOAR.id}&org_id=${org.id}`);
            const casesRawData = await casesResponse.json();

            if (casesRawData["error"]) {
                return;
            }

            updatedCaseDataForest[updatedCaseDataForest.length - 1].children = casesRawData["cases"].map((caseData) => ({
                id: caseData.id,
                label: `${caseData.title} (${caseData.id})`,
                title: caseData.title,
                description: caseData.description
            }));

            for (let caseData of casesRawData["cases"]) {
                fetchedCaseIds.push(caseData.id);
                updatedCaseOrgIds[caseData.id] = org.id;
            }
        }
        setCaseIds(fetchedCaseIds);
        setCaseOrgIds(updatedCaseOrgIds);
        setCaseDataForest(updatedCaseDataForest);
    }

    const refresh = async () => {
        testAIBackendConnection();

        if (AIBackendConnected) {
            buildCaseDataForest();
        }
    }

    useEffect(() => {
        if (!AIBackendConnected) {
            return;
        }

        buildCaseDataForest();
    }, [AIBackendConnected]);

    useEffect(() => {
        testAIBackendConnection();
    }, []);

    return (
        <>
            <Helmet>
                <title>AI Systems</title>
            </Helmet>
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar names={["AI Systems"]} routes={["/ai-systems"]} />
                <VerticalNavbar />
                <Box component="main" sx={{ display: "grid", flexGrow: 1, p: 2, mt: 5.5, gap: 1 }}>
                    <Box>
                        <Typography sx={{ display: "inline-block", marginRight: 1 }}>AI Backend Status: </Typography>
                        <Typography sx={{ display: "inline-block", color: AIBackendConnected ? "success.main" : "error.main" }}>{AIBackendConnected ? "Connected" : "Disconnected"}</Typography>
                        <Tooltip title="Refresh">
                            <IconButton sx={{ float: "right" }} onClick={refresh}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <TaskGenerationTrainerDashboard caseIds={caseIds} caseOrgIds={caseOrgIds} caseDataForest={caseDataForest} />
                    <ActivityGenerationTrainerDashboard caseIds={caseIds} caseOrgIds={caseOrgIds} caseDataForest={caseDataForest} />
                    <QueryGenerationTrainerDashboard caseIds={caseIds} caseOrgIds={caseOrgIds} caseDataForest={caseDataForest} />
                </Box>
            </Box>
        </>
    )
}