import { Helmet } from "react-helmet";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { TaskGenerationTrainerDashboard } from "../components/ai_system_dashboard/TaskGenerationTrainerDashboard";
import { useEffect, useState } from "react";
import RefreshIcon from '@mui/icons-material/Refresh';
import { ActivityGenerationTrainerDashboard } from "../components/ai_system_dashboard/ActivityGenerationTrainerDashboard";
import { QueryGenerationTrainerDashboard } from "../components/ai_system_dashboard/QueryGenerationTrainerDashboard";
import { useCookies } from "react-cookie";
import { CaseData, CaseDataForest, OrganizationData, TargetSOARInfo } from "../types/types";


interface ConnectionResponse {
    code?: string;
    error?: string;
    connected?: boolean;
}

interface OrganizationsResponse {
    code?: string;
    error?: string;
    organizations?: OrganizationData[];
}

interface CasesResponse {
    code?: string;
    error?: string;
    cases?: CaseData[];
}

export const AISystems = () => {
    const [cookies, , removeCookies] = useCookies(["token"]);
    const [AIBackendConnected, setAIBackendConnected] = useState<boolean>(false);
    const [caseIds, setCaseIds] = useState<string[]>([]);
    const [caseOrgIds, setCaseOrgIds] = useState<Record<string, string>>({});
    const [caseDataForest, setCaseDataForest] = useState<CaseDataForest[]>([]);

    const [targetSOAR, _] = useState<TargetSOARInfo | null>(() => {
        const saved = localStorage.getItem("targetSOAR");
        try {
            const initialValue = JSON.parse(saved || "");
            return initialValue || null;
        } catch {
            return null;
        }
    });

    const testAIBackendConnection = async () => {
        const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}ai_backend/status/`,
            {
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                }
            }
        );
        const responseJson: ConnectionResponse = await response.json();

        if (responseJson.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        setAIBackendConnected(responseJson.connected ?? false);
    };

    const buildCaseDataForest = async () => {
        if (!targetSOAR) return;

        const orgsResponse = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}soar/organizations/?soar_id=${targetSOAR.id}`,
            {
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                }
            }
        );
        const orgsRawData: OrganizationsResponse = await orgsResponse.json();

        if (orgsRawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        if (orgsRawData.error) {
            return;
        }

        const updatedCaseDataForest: CaseDataForest[] = [];
        const fetchedCaseIds: string[] = [];
        const updatedCaseOrgIds: Record<string, string> = {};

        for (const org of orgsRawData.organizations || []) {
            const node: CaseDataForest = {
                id: org.id,
                label: `${org.name} (${org.id})`,
                children: [],
            };

            const casesResponse = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}soar/case/?soar_id=${targetSOAR.id}&org_id=${org.id}`,
                {
                    headers: {
                        "Authorization": `Bearer ${cookies.token}`
                    }
                }
            );
            const casesRawData: CasesResponse = await casesResponse.json();

            if (casesRawData.code === "token_not_valid") {
                removeCookies("token");
                return;
            }

            if (casesRawData.error) {
                return;
            }

            node.children = (casesRawData.cases || []).map((caseData) => ({
                id: caseData.id,
                label: `${caseData.title} (${caseData.id})`,
                title: caseData.title,
                description: caseData.description
            }));

            for (const caseData of casesRawData.cases || []) {
                fetchedCaseIds.push(caseData.id);
                updatedCaseOrgIds[caseData.id] = org.id;
            }

            updatedCaseDataForest.push(node);
        }

        setCaseIds(fetchedCaseIds);
        setCaseOrgIds(updatedCaseOrgIds);
        setCaseDataForest(updatedCaseDataForest);
    };

    const refresh = async () => {
        await testAIBackendConnection();
        if (AIBackendConnected) {
            await buildCaseDataForest();
        }
    };

    useEffect(() => {
        if (AIBackendConnected) {
            buildCaseDataForest();
        }
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
                        <Typography sx={{ display: "inline-block", marginRight: 1 }}>
                            AI Backend Status:
                        </Typography>
                        <Typography sx={{ display: "inline-block", color: AIBackendConnected ? "success.main" : "error.main" }}>
                            {AIBackendConnected ? "Connected" : "Disconnected"}
                        </Typography>
                        <Tooltip title="Refresh">
                            <IconButton sx={{ float: "right" }} onClick={refresh}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <TaskGenerationTrainerDashboard
                        caseIds={caseIds}
                        caseOrgIds={caseOrgIds}
                        caseDataForest={caseDataForest}
                    />
                    <ActivityGenerationTrainerDashboard
                        caseIds={caseIds}
                        caseOrgIds={caseOrgIds}
                        caseDataForest={caseDataForest}
                    />
                    <QueryGenerationTrainerDashboard
                        caseIds={caseIds}
                        caseOrgIds={caseOrgIds}
                        caseDataForest={caseDataForest}
                    />
                </Box>
            </Box>
        </>
    );
};
