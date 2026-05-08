import type { AgentSettingsApiResult, AgentSettingsResponse, ConnectionResponse } from "../../../types/types";

const getAuthHeaders = (token: string, includeContentType = false): HeadersInit => {
    if (includeContentType) {
        return {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }

    return {
        "Authorization": `Bearer ${token}`,
    };
};

export const isTokenNotValid = (code?: string): boolean => code === "token_not_valid";

export const fetchAIBackendStatus = async (
    backendUrl: string,
    token: string
): Promise<ConnectionResponse> => {
    const response = await fetch(
        `${backendUrl}ai_backend/status/`,
        {
            headers: getAuthHeaders(token),
        }
    );

    const data: ConnectionResponse = await response.json();
    return data;
};

export const fetchAgentSettingsData = async (
    backendUrl: string,
    token: string
): Promise<AgentSettingsApiResult> => {
    const response = await fetch(
        `${backendUrl}ai_backend/settings/`,
        {
            headers: getAuthHeaders(token),
        }
    );

    const data: AgentSettingsResponse = await response.json();
    return {
        ok: response.ok,
        data,
    };
};

export const saveAgentSettingsData = async (
    backendUrl: string,
    token: string,
    reportTemplates: Record<string, string>
): Promise<AgentSettingsApiResult> => {
    const response = await fetch(
        `${backendUrl}ai_backend/settings/`,
        {
            method: "PUT",
            headers: getAuthHeaders(token, true),
            body: JSON.stringify({
                report_templates: reportTemplates,
            }),
        }
    );

    const data: AgentSettingsResponse = await response.json();
    return {
        ok: response.ok,
        data,
    };
};