import type { AutomationSettingsApiResult, AutomationSettingsResponse, AutomationSettings } from "../../../types/types";

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

export const fetchAutomationSettings = async (
    backendUrl: string,
    token: string,
    soarId: string,
    orgId: string,
    caseId: string
): Promise<AutomationSettingsApiResult> => {
    const response = await fetch(
        `${backendUrl}ai_backend/automation_settings/?soar_id=${soarId}&org_id=${orgId}&case_id=${caseId}`,
        {
            headers: getAuthHeaders(token),
        }
    );

    const data: AutomationSettingsResponse = await response.json();
    return {
        ok: response.ok,
        data,
    };
};

export const saveAutomationSettings = async (
    backendUrl: string,
    token: string,
    soarId: string,
    orgId: string,
    caseId: string,
    settings: AutomationSettings
): Promise<AutomationSettingsApiResult> => {
    const response = await fetch(
        `${backendUrl}ai_backend/automation_settings/`,
        {
            method: "PUT",
            headers: getAuthHeaders(token, true),
            body: JSON.stringify({
                soar_id: soarId,
                org_id: orgId,
                case_id: caseId,
                automation_settings: settings,
            }),
        }
    );

    const data: AutomationSettingsResponse = await response.json();
    return {
        ok: response.ok,
        data,
    };
};
