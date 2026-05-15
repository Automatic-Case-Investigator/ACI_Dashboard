import type { GridColDef } from "@mui/x-data-grid";
import type { MouseEvent, ReactElement, ReactNode } from "react";

export type CallbackFunction = (...args: any[]) => void;

export interface ActionObject {
    func?: (params?: any) => Promise<void> | void;
    args?: any[];
}

export interface SOARData {
    id: number;
    name: string;
    type: string;
    url: string;
    apiKey: string;
    isTarget: boolean;
}

export interface SIEMConfigFile {
    filename: string;
    content?: string;
    file?: File | null;
    hashDigest?: string;
}

export interface SIEMData {
    id: number;
    name: string;
    type: string;
    url: string;
    useAPIKey: boolean;
    authType: string;
    apiKey?: string;
    username?: string;
    password?: string;
    isTarget: boolean;
    configFiles?: SIEMConfigFile[];
}

export interface TargetSOARInfo {
    id: string;
}

export interface TargetSIEMInfo {
    id: string;
}

export interface OrganizationData {
    id: string;
    name: string;
    description: string;
}

export interface CaseData {
    id: string;
    title: string;
    description: string;
    tlp: number;
    pap: number;
}

export interface CaseDataForest {
    id: string;
    label: string;
    title?: string;
    description?: string;
    children?: CaseDataForest[];
}

export interface TaskData {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    createdBy: string;
    group: string;
    status: string;
}

export interface TaskLogData {
    id: string;
    message: string;
    createdAt: Date;
    createdBy: string;
}

export interface ObservableData {
    id: string;
    type: string,
    createdBy: string;
    createdAt: Date;
    dataType: string;
    data: string;
    startDate: Date;
    tlp: number;
    pap: number;
    ioc: boolean;
    reports: any;
}

export interface DocumentData {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    createdBy: string;
    category: string;
}

export interface ConnectionResponse {
    code?: string;
    error?: string;
    connected?: boolean;
}

export interface AgentSettingsResponse {
    code?: string;
    message?: string;
    error?: string;
    settings?: {
        report_templates?: Record<string, string>;
        updated_at?: string;
    };
}

export interface AgentSettingsApiResult {
    ok: boolean;
    data: AgentSettingsResponse;
}

export interface TargetSOARStorageData {
    id: number;
    [key: string]: any;
}

export interface EditSIEMInfoDialogProps {
    selectedSiemData?: SIEMData;
    onClose: CallbackFunction;
    onSave: CallbackFunction;
}

export interface NewSIEMInfoDialogProps {
    onClose: CallbackFunction;
    onCreate: CallbackFunction;
}

export interface EditSOARInfoDialogProps {
    selectedSoarData?: SOARData;
    onClose: CallbackFunction;
    onSave: CallbackFunction;
}

export interface NewSOARInfoDialogProps {
    onClose: CallbackFunction;
    onCreate: CallbackFunction;
}

export interface TokenResponse {
    access?: string;
    detail?: string;
}

export interface NavDrawerContextType {
    mobileOpen: boolean;
    toggleMobileDrawer: () => void;
    closeMobileDrawer: () => void;
}

export interface NavDrawerProviderProps {
    children: ReactNode;
}

export interface DataGridListProps<T> {
    data: T[];
    columns: GridColDef[];
    pageSize: number;
    navigatePath?: (id: string) => string;
    onMassDelete: (ids: string[]) => void | Promise<void>;
    enableSelection: boolean;
}

export interface TaskPageHeaderDetailsProps {
    taskData: TaskData;
    onBack: () => void;
}

export interface AuthMiddlewareProps {
    child: ReactElement;
}

export interface Job {
    id: string;
    status: string;
    result: string;
    createdAt: Date;
    finishedAt: Date;
    elapsedTime: string;
}

export interface BaseRequestParams {
    backendUrl: string;
    token: string;
}

export interface FetchTaskDataParams extends BaseRequestParams {
    soarId: string;
    orgId: string;
    taskId: string;
}

export interface FetchTaskLogsParams extends BaseRequestParams {
    soarId: string;
    taskId: string;
}

export interface SaveTaskLogParams extends BaseRequestParams {
    soarId: string;
    taskId: string;
    taskLogId: string;
    taskLogData: string;
}

export interface DeleteTaskLogParams extends BaseRequestParams {
    soarId: string;
    taskId: string;
    taskLogId: string;
}

export interface HorizontalNavbarProps {
    names: string[];
    routes: string[];
}

export interface ConfirmationDialogProps {
    onCancel: CallbackFunction;
    onContinue: CallbackFunction;
}

export interface DocumentListProps {
    documentList: DocumentData[];
    soarId: string;
    orgId: string;
    caseId: string;
    onRefresh: CallbackFunction;
}

export interface ResetCredentialsModalProps {
    open: boolean;
    onClose: CallbackFunction;
}

export interface TaskListProps {
    taskList: TaskData[];
    soarId: string;
    orgId: string;
    caseId: string;
    onRefresh: CallbackFunction;
}

export interface ObservableListProps {
    observableList: ObservableData[];
    soarId: string;
    orgId: string;
    caseId: string;
    onRefresh: CallbackFunction;
}

export interface TaskPreviewProps {
    open: boolean;
    onClose: CallbackFunction;
    orgId: string;
    caseId: string;
    taskId: string;
}

export interface TaskInvestigationDialogProps {
    open: boolean;
    onClose: () => void;
    webSearchEnabled: boolean;
    setWebSearchEnabled: (value: boolean) => void;
    earliestMagnitude: number | "";
    setEarliestMagnitude: (value: number | "") => void;
    earliestUnit: string;
    setEarliestUnit: (value: string) => void;
    vicinityMagnitude: number | "";
    setVicinityMagnitude: (value: number | "") => void;
    vicinityUnit: string;
    setVicinityUnit: (value: string) => void;
    maxIterations: number | "";
    setMaxIterations: (value: number | "") => void;
    maxQueriesPerIteration: number | "";
    setMaxQueriesPerIteration: (value: number | "") => void;
    additionalNotes: string;
    setAdditionalNotes: (value: string) => void;
    correctEarliestMagnitude: () => number;
    correctVicinityMagnitude: () => number;
    correctMaxIterations: () => number;
    correctMaxQueriesPerIteration: () => number;
    onInvestigate: () => void;
}

export interface TaskLogSectionProps {
    taskData: TaskData;
    taskLogs: TaskLogData[];
    openLogIndexes: number[];
    editingLogs: Record<string, string>;
    logSaving: boolean;
    copySuccessId: string | null;
    menuAnchorEl: { [key: string]: HTMLButtonElement | null };
    onToggleLogOpen: (index: number) => void;
    onStartEdit: (logId: string, index: number, message: string) => void;
    onSave: (logId: string) => Promise<void>;
    onCancelEdit: (logId: string) => void;
    onCopy: (message: string, logId: string) => void;
    onMenuOpen: (event: MouseEvent<HTMLButtonElement>, logId: string) => void;
    onMenuClose: (logId: string) => void;
    onInvestigate: (message: string, logId: string) => void;
    onDelete: (logId: string) => void;
    onEditingChange: (logId: string, value: string | undefined) => void;
}

export interface WebSearchEnableState {
    task_generation: boolean;
    activity_generation: boolean;
    siem_investigation: boolean;
}

export interface AutomationSettings {
    enableWebSearch: WebSearchEnableState;
    earliestMagnitude: number;
    earliestUnit: string;
    vicinityMagnitude: number;
    vicinityUnit: string;
    maxIterations: number;
    maxQueriesPerIteration: number;
    additionalNotes: string;
}

export interface AutomationSettingsResponse {
    code?: string;
    message?: string;
    error?: string;
    settings?: AutomationSettings;
    updated_at?: string;
}

export interface AutomationSettingsApiResult {
    ok: boolean;
    data: AutomationSettingsResponse;
}

// ─── Auto Workflow Settings ────────────────────────────────────────────────

export interface WorkflowActionSettings {
    enabled: boolean;
    use_web_search: boolean;
    additional_notes: string;
}

export interface WorkflowInvestigationSettings extends WorkflowActionSettings {
    earliest_magnitude: number;
    earliest_unit: string;
    vicinity_magnitude: number;
    vicinity_unit: string;
    max_iterations: number;
    max_queries_per_iteration: number;
}

export interface WorkflowReportSettings extends WorkflowActionSettings {
    report_template_id: string;
}

export interface WorkflowSettings {
    enabled: boolean;
    max_concurrent_workflows: number;
    soar_id: string;
    webhook: {
        bearer_key: string;
    };
    task_generation: WorkflowActionSettings;
    activity_generation: WorkflowActionSettings;
    investigation: WorkflowInvestigationSettings;
    report_generation: WorkflowReportSettings;
}

export interface SOAROption {
    id: number;
    name: string;
}

export interface SOARInfoResponse {
    code?: string;
    error?: string;
    message?: SOAROption[];
}

export interface WorkflowSettingsResponse {
    code?: string;
    error?: string;
    settings?: WorkflowSettings;
}

export interface WorkflowSettingsApiResult {
    ok: boolean;
    status: number;
    data: WorkflowSettingsResponse;
}

export interface CaseAutomationsTabProps {
    enableWebSearch: WebSearchEnableState;
    setEnableWebSearch: (value: WebSearchEnableState) => void;
    earliestMagnitude: number | "";
    setEarliestMagnitude: (value: number | "") => void;
    earliestUnit: string;
    setEarliestUnit: (value: string) => void;
    vicinityMagnitude: number | "";
    setVicinityMagnitude: (value: number | "") => void;
    vicinityUnit: string;
    setVicinityUnit: (value: string) => void;
    maxIterations: number | "";
    setMaxIterations: (value: number | "") => void;
    maxQueriesPerIteration: number | "";
    setMaxQueriesPerIteration: (value: number | "") => void;
    additionalNotes: string;
    setAdditionalNotes: (value: string) => void;
    correctEarliestMagnitude: () => number;
    correctVicinityMagnitude: () => number;
    correctMaxIterations: () => number;
    correctMaxQueriesPerIteration: () => number;
    onGenerateTask: () => void;
    onGenerateActivity: () => void;
    onInvestigateTask: () => void;
    reportTemplateIds: string[];
    selectedReportTemplateId: string;
    setSelectedReportTemplateId: (value: string) => void;
    onGenerateReport: () => void;
}