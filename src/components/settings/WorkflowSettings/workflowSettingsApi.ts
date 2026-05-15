import type { WorkflowSettings, WorkflowSettingsApiResult, WorkflowSettingsResponse } from "../../../types/types";

const authHeaders = (token: string): HeadersInit => ({
    "Authorization": `Bearer ${token}`,
});

const authJsonHeaders = (token: string): HeadersInit => ({
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
});

export const isTokenNotValid = (code?: string): boolean => code === "token_not_valid";

export const fetchWorkflowSettings = async (
    backendUrl: string,
    token: string
): Promise<WorkflowSettingsApiResult> => {
    const response = await fetch(`${backendUrl}ai_backend/workflow/settings/`, {
        headers: authHeaders(token),
    });

    const data: WorkflowSettingsResponse = await response.json();
    return { ok: response.ok, status: response.status, data };
};

export const saveWorkflowSettings = async (
    backendUrl: string,
    token: string,
    settings: WorkflowSettings
): Promise<WorkflowSettingsApiResult> => {
    const response = await fetch(`${backendUrl}ai_backend/workflow/settings/`, {
        method: "PUT",
        headers: authJsonHeaders(token),
        body: JSON.stringify({ settings }),
    });

    const data: WorkflowSettingsResponse = await response.json();
    return { ok: response.ok, status: response.status, data };
};
