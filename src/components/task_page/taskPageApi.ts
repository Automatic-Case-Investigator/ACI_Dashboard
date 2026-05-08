import { DeleteTaskLogParams, FetchTaskDataParams, FetchTaskLogsParams, SaveTaskLogParams } from "../../types/types";

const fetchJson = async (url: string, token: string, init?: RequestInit) => {
    const response = await fetch(url, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            ...(init?.headers || {}),
        },
    });

    return response.json();
};

export const fetchTaskDataApi = async (params: FetchTaskDataParams) => {
    const { backendUrl, token, soarId, orgId, taskId } = params;
    return fetchJson(`${backendUrl}soar/task/?soar_id=${soarId}&org_id=${orgId}&task_id=${taskId}`, token);
};

export const fetchTaskLogsApi = async (params: FetchTaskLogsParams) => {
    const { backendUrl, token, soarId, taskId } = params;
    return fetchJson(`${backendUrl}soar/task_log/?soar_id=${soarId}&task_id=${taskId}`, token);
};

export const saveTaskLogApi = async (params: SaveTaskLogParams) => {
    const { backendUrl, token, soarId, taskId, taskLogId, taskLogData } = params;
    const requestBody = new FormData();
    requestBody.append("soar_id", soarId);
    requestBody.append("task_id", taskId);
    requestBody.append("task_log_id", taskLogId);
    requestBody.append("task_log_data", taskLogData);

    return fetchJson(`${backendUrl}soar/task_log/`, token, {
        method: "POST",
        body: requestBody,
    });
};

export const deleteTaskLogApi = async (params: DeleteTaskLogParams) => {
    const { backendUrl, token, soarId, taskId, taskLogId } = params;
    const requestBody = new FormData();
    requestBody.append("soar_id", soarId);
    requestBody.append("task_id", taskId);
    requestBody.append("task_log_id", taskLogId);

    return fetchJson(`${backendUrl}soar/task_log/`, token, {
        method: "DELETE",
        body: requestBody,
    });
};