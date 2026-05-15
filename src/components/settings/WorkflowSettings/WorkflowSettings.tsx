import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import LockIcon from "@mui/icons-material/Lock";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useCookies } from "react-cookie";
import {
    SOARInfoResponse,
    SOAROption,
    WorkflowActionSettings,
    WorkflowInvestigationSettings,
    WorkflowReportSettings,
    WorkflowSettings as WorkflowSettingsType,
} from "../../../types/types";
import {
    fetchWorkflowSettings,
    isTokenNotValid,
    saveWorkflowSettings,
} from "./workflowSettingsApi";

const DEFAULT_SETTINGS: WorkflowSettingsType = {
    enabled: false,
    max_concurrent_workflows: 3,
    soar_id: "",
    webhook: {
        bearer_key: "",
    },
    task_generation: { enabled: false, use_web_search: false, additional_notes: "" },
    activity_generation: { enabled: false, use_web_search: false, additional_notes: "" },
    investigation: {
        enabled: false,
        use_web_search: false,
        additional_notes: "",
        earliest_magnitude: 1,
        earliest_unit: "years",
        vicinity_magnitude: 1,
        vicinity_unit: "hours",
        max_iterations: 3,
        max_queries_per_iteration: 5,
    },
    report_generation: { enabled: false, use_web_search: false, additional_notes: "", report_template_id: "" },
};

// ─── Action step helpers ───────────────────────────────────────────────────

interface StepHeaderProps {
    index: number;
    label: string;
    enabled: boolean;
    locked: boolean;
    onToggle: (val: boolean) => void;
}

const StepHeader = ({ index, label, enabled, locked, onToggle }: StepHeaderProps) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {enabled ? (
            <CheckCircleIcon color="success" fontSize="small" />
        ) : locked ? (
            <LockIcon sx={{ color: "text.disabled", fontSize: 18 }} />
        ) : (
            <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
        )}
        <Typography
            variant="subtitle1"
            sx={{ flex: 1, color: locked ? "text.disabled" : "text.primary", fontWeight: 600 }}
        >
            {index}. {label}
        </Typography>
        <Tooltip
            title={locked ? "Enable all previous steps first" : enabled ? "Disable this step" : "Enable this step"}
        >
            <span>
                <Switch
                    checked={enabled}
                    disabled={locked}
                    onChange={(e) => onToggle(e.target.checked)}
                    color="secondary"
                    size="small"
                />
            </span>
        </Tooltip>
    </Box>
);

// ─── Shared web-search + notes sub-form ───────────────────────────────────

interface CommonActionFieldsProps {
    settings: WorkflowActionSettings;
    disabled: boolean;
    onChange: (patch: Partial<WorkflowActionSettings>) => void;
}

const CommonActionFields = ({ settings, disabled, onChange }: CommonActionFieldsProps) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Switch
                checked={settings.use_web_search}
                disabled={disabled}
                onChange={(e) => onChange({ use_web_search: e.target.checked })}
                color="secondary"
                size="small"
            />
            <Typography variant="body2">Enable web search</Typography>
        </Box>
        <TextField
            label="Additional notes"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={settings.additional_notes}
            disabled={disabled}
            onChange={(e) => onChange({ additional_notes: e.target.value })}
        />
    </Box>
);

// ─── Investigation-specific extra fields ─────────────────────────────────

interface InvestigationFieldsProps {
    settings: WorkflowInvestigationSettings;
    disabled: boolean;
    onChange: (patch: Partial<WorkflowInvestigationSettings>) => void;
}

const TIME_UNITS_EARLIEST = ["hours", "days", "weeks", "months", "years"];
const TIME_UNITS_VICINITY = ["minutes", "hours", "days"];

const InvestigationFields = ({ settings, disabled, onChange }: InvestigationFieldsProps) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box>
                <Typography variant="caption" gutterBottom>Earliest lookback</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                        size="small"
                        type="number"
                        value={settings.earliest_magnitude}
                        disabled={disabled}
                        onChange={(e) => onChange({ earliest_magnitude: Math.max(1, Number(e.target.value)) })}
                        inputProps={{ min: 1 }}
                        sx={{ width: 80 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 110 }} disabled={disabled}>
                        <InputLabel>Unit</InputLabel>
                        <Select
                            value={settings.earliest_unit}
                            label="Unit"
                            onChange={(e) => onChange({ earliest_unit: e.target.value })}
                        >
                            {TIME_UNITS_EARLIEST.map((u) => (
                                <MenuItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Box>
                <Typography variant="caption" gutterBottom>Vicinity window</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                        size="small"
                        type="number"
                        value={settings.vicinity_magnitude}
                        disabled={disabled}
                        onChange={(e) => onChange({ vicinity_magnitude: Math.max(1, Number(e.target.value)) })}
                        inputProps={{ min: 1 }}
                        sx={{ width: 80 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 110 }} disabled={disabled}>
                        <InputLabel>Unit</InputLabel>
                        <Select
                            value={settings.vicinity_unit}
                            label="Unit"
                            onChange={(e) => onChange({ vicinity_unit: e.target.value })}
                        >
                            {TIME_UNITS_VICINITY.map((u) => (
                                <MenuItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
                label="Max iterations"
                size="small"
                type="number"
                value={settings.max_iterations}
                disabled={disabled}
                onChange={(e) => onChange({ max_iterations: Math.max(1, Number(e.target.value)) })}
                inputProps={{ min: 1 }}
                sx={{ width: 140 }}
            />
            <TextField
                label="Max queries / iteration"
                size="small"
                type="number"
                value={settings.max_queries_per_iteration}
                disabled={disabled}
                onChange={(e) => onChange({ max_queries_per_iteration: Math.min(20, Math.max(1, Number(e.target.value))) })}
                inputProps={{ min: 1, max: 20 }}
                sx={{ width: 180 }}
            />
        </Box>
    </Box>
);

// ─── Report extra fields ──────────────────────────────────────────────────

interface ReportFieldsProps {
    settings: WorkflowReportSettings;
    templateIds: string[];
    disabled: boolean;
    onChange: (patch: Partial<WorkflowReportSettings>) => void;
}

const ReportFields = ({ settings, templateIds, disabled, onChange }: ReportFieldsProps) => (
    <Box sx={{ mt: 1 }}>
        <FormControl size="small" fullWidth disabled={disabled || templateIds.length === 0}>
            <InputLabel>Report template</InputLabel>
            <Select
                value={settings.report_template_id}
                label="Report template"
                onChange={(e) => onChange({ report_template_id: e.target.value })}
            >
                {templateIds.length === 0 ? (
                    <MenuItem value="" disabled>No templates available</MenuItem>
                ) : (
                    templateIds.map((id) => (
                        <MenuItem key={id} value={id}>{id}</MenuItem>
                    ))
                )}
            </Select>
        </FormControl>
    </Box>
);

// ─── Main component ────────────────────────────────────────────────────────

export const WorkflowSettings = () => {
    const [cookies, , removeCookies] = useCookies(["token"]);
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "";

    const [settings, setSettings] = useState<WorkflowSettingsType>(DEFAULT_SETTINGS);
    const [reportTemplates, setReportTemplates] = useState<string[]>([]);
    const [soarOptions, setSoarOptions] = useState<SOAROption[]>([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showBearerKey, setShowBearerKey] = useState(false);
    const [copiedBearerKey, setCopiedBearerKey] = useState(false);

    const handleTokenInvalid = (code?: string): boolean => {
        if (!isTokenNotValid(code)) return false;
        removeCookies("token");
        return true;
    };

    const load = async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const { ok, data } = await fetchWorkflowSettings(backendUrl, cookies.token);
            if (handleTokenInvalid(data.code)) return;
            if (!ok) { setError(data.error || "Failed to load workflow settings."); return; }
            if (data.settings) {
                setSettings({
                    ...DEFAULT_SETTINGS,
                    ...data.settings,
                    webhook: {
                        ...DEFAULT_SETTINGS.webhook,
                        ...data.settings.webhook,
                    },
                });
            }

            // Also read report template keys from agent settings response
            const agentResp = await fetch(`${backendUrl}ai_backend/settings/`, {
                headers: { Authorization: `Bearer ${cookies.token}` },
            });
            const agentData = await agentResp.json();
            if (handleTokenInvalid(agentData.code)) return;
            const tplKeys = Object.keys(agentData.settings?.report_templates || {});
            setReportTemplates(tplKeys);

            // Read SOAR options for workflow execution target.
            const soarResp = await fetch(`${backendUrl}soar/soar_info/`, {
                headers: { Authorization: `Bearer ${cookies.token}` },
            });
            const soarData: SOARInfoResponse = await soarResp.json();
            if (handleTokenInvalid(soarData.code)) return;
            setSoarOptions((soarData.message || []).map((soar) => ({ id: soar.id, name: soar.name })));
        } catch {
            setError("Failed to load workflow settings.");
        } finally {
            setLoading(false);
        }
    };

    const save = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const { ok, status, data } = await saveWorkflowSettings(backendUrl, cookies.token, settings);
            if (handleTokenInvalid(data.code)) return;
            if (!ok) {
                setError(status === 422 ? "Invalid workflow settings" : data.error || "Failed to save workflow settings.");
                return;
            }
            if (data.settings) setSettings(data.settings);
            setSuccess("Workflow settings saved.");
        } catch {
            setError("Failed to save workflow settings.");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => { load(); }, []);

    // ── Cascading enable/disable helpers ──────────────────────────────────

    const patchAction = <K extends keyof WorkflowSettingsType>(
        key: K,
        patch: Partial<WorkflowSettingsType[K]>
    ) => {
        setSettings((prev) => ({ ...prev, [key]: { ...(prev[key] as object), ...patch } }));
        setSuccess("");
    };

    const setActionEnabled = (
        key: "task_generation" | "activity_generation" | "investigation" | "report_generation",
        val: boolean
    ) => {
        const order: Array<typeof key> = ["task_generation", "activity_generation", "investigation", "report_generation"];
        const idx = order.indexOf(key);
        setSettings((prev) => {
            const next = { ...prev };
            if (val) {
                // Enable this step (preceding steps must already be on – enforced by locked state in UI)
                (next[key] as WorkflowActionSettings).enabled = true;
            } else {
                // Disable this step AND all subsequent ones
                for (let i = idx; i < order.length; i++) {
                    (next[order[i]] as WorkflowActionSettings).enabled = false;
                }
            }
            return next;
        });
        setSuccess("");
    };

    // Step is locked when any preceding step is disabled
    const actionOrder: Array<"task_generation" | "activity_generation" | "investigation" | "report_generation"> =
        ["task_generation", "activity_generation", "investigation", "report_generation"];

    const isLocked = (key: typeof actionOrder[number]) => {
        const idx = actionOrder.indexOf(key);
        return idx > 0 && !(settings[actionOrder[idx - 1]] as WorkflowActionSettings).enabled;
    };

    const actionDisabled = (key: typeof actionOrder[number]) =>
        loading || saving || !(settings[key] as WorkflowActionSettings).enabled;

    const generateBearerKey = () => {
        const randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        const hex = Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0")).join("");
        setSettings((prev) => ({
            ...prev,
            webhook: {
                ...prev.webhook,
                bearer_key: `wf_${hex}`,
            },
        }));
        setSuccess("");
    };

    const copyBearerKey = async () => {
        if (!settings.webhook.bearer_key) return;
        await navigator.clipboard.writeText(settings.webhook.bearer_key);
        setCopiedBearerKey(true);
        setTimeout(() => setCopiedBearerKey(false), 1200);
    };

    return (
        <Box mb={2}>
            <Typography variant="h6">Automation Workflow</Typography>

            <Paper sx={{ p: 2, mt: 1 }}>
                {/* ── Header row ── */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Typography>Enable workflow</Typography>
                        <Switch
                            checked={settings.enabled}
                            disabled={loading || saving}
                            onChange={(e) => { setSettings((p) => ({ ...p, enabled: e.target.checked })); setSuccess(""); }}
                            color="secondary"
                        />
                    </Box>
                    <Tooltip title="Refresh">
                        <IconButton onClick={load} disabled={loading || saving}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* ── Execution target ── */}
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>SOAR to execute workflow automation</Typography>
                    <FormControl size="small" fullWidth disabled={loading || saving || soarOptions.length === 0}>
                        <InputLabel>Execution SOAR</InputLabel>
                        <Select
                            value={settings.soar_id}
                            label="Execution SOAR"
                            onChange={(e) => {
                                setSettings((p) => ({ ...p, soar_id: e.target.value }));
                                setSuccess("");
                            }}
                        >
                            {soarOptions.length === 0 ? (
                                <MenuItem value="" disabled>No SOAR integrations available</MenuItem>
                            ) : (
                                soarOptions.map((soar) => (
                                    <MenuItem key={soar.id} value={String(soar.id)}>{soar.name}</MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary">
                        Choose which configured SOAR integration should run workflow automation actions.
                    </Typography>
                </Box>

                {/* ── Webhook access ── */}
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Webhook URL: <br /><code>{`${process.env.REACT_APP_BACKEND_URL}ai_backend/workflow/webhook/case-ingest/`}</code>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>Webhook bearer key</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        type={showBearerKey ? "text" : "password"}
                        value={settings.webhook.bearer_key}
                        disabled={loading || saving}
                        placeholder="Generate a bearer key"
                        onChange={(e) => {
                            setSettings((prev) => ({
                                ...prev,
                                webhook: {
                                    ...prev.webhook,
                                    bearer_key: e.target.value,
                                },
                            }));
                            setSuccess("");
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Tooltip title={showBearerKey ? "Hide key" : "Show key"}>
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={() => setShowBearerKey((prev) => !prev)}
                                                disabled={loading || saving}
                                            >
                                                {showBearerKey ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title={copiedBearerKey ? "Copied" : "Copy key"}>
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={copyBearerKey}
                                                disabled={loading || saving || !settings.webhook.bearer_key}
                                            >
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title="Generate key">
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={generateBearerKey}
                                                disabled={loading || saving}
                                            >
                                                <AutorenewIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        This key is required by webhook callers. Generate a new one and click Save to persist it.
                    </Typography>
                </Box>

                {/* ── Execution constraints ── */}
                <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography>Max concurrent workflows:</Typography>
                    <TextField
                        type="number"
                        size="small"
                        value={settings.max_concurrent_workflows}
                        disabled={loading || saving}
                        onChange={(e) => { setSettings((p) => ({ ...p, max_concurrent_workflows: Math.max(1, Number(e.target.value)) })); setSuccess(""); }}
                        inputProps={{ min: 1, max: 50 }}
                        InputProps={{ endAdornment: <InputAdornment position="end">workflows</InputAdornment> }}
                        sx={{ width: 190 }}
                    />
                </Box>

                <Divider sx={{ my: 2.5 }} />

                {/* ── Sequential action pipeline ── */}
                <Typography variant="subtitle2" sx={{ mb: 1.5, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}>
                    Action pipeline (sequential)
                </Typography>

                {/* Connector line visual */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>

                    {/* 1 – Task generation */}
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                        <StepHeader
                            index={1} label="Task Generation"
                            enabled={settings.task_generation.enabled}
                            locked={isLocked("task_generation")}
                            onToggle={(v) => setActionEnabled("task_generation", v)}
                        />
                        {settings.task_generation.enabled && (
                            <CommonActionFields
                                settings={settings.task_generation}
                                disabled={actionDisabled("task_generation")}
                                onChange={(p) => patchAction("task_generation", p)}
                            />
                        )}
                    </Paper>

                    {/* Arrow */}
                    <Box sx={{ display: "flex", justifyContent: "center", color: "text.disabled", lineHeight: 1 }}>▼</Box>

                    {/* 2 – Activity generation */}
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                        <StepHeader
                            index={2} label="Activity Generation"
                            enabled={settings.activity_generation.enabled}
                            locked={isLocked("activity_generation")}
                            onToggle={(v) => setActionEnabled("activity_generation", v)}
                        />
                        {settings.activity_generation.enabled && (
                            <CommonActionFields
                                settings={settings.activity_generation}
                                disabled={actionDisabled("activity_generation")}
                                onChange={(p) => patchAction("activity_generation", p)}
                            />
                        )}
                    </Paper>

                    <Box sx={{ display: "flex", justifyContent: "center", color: "text.disabled", lineHeight: 1 }}>▼</Box>

                    {/* 3 – Automatic investigation */}
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                        <StepHeader
                            index={3} label="Automatic Investigation"
                            enabled={settings.investigation.enabled}
                            locked={isLocked("investigation")}
                            onToggle={(v) => setActionEnabled("investigation", v)}
                        />
                        {settings.investigation.enabled && (
                            <>
                                <InvestigationFields
                                    settings={settings.investigation}
                                    disabled={actionDisabled("investigation")}
                                    onChange={(p) => patchAction("investigation", p)}
                                />
                                <CommonActionFields
                                    settings={settings.investigation}
                                    disabled={actionDisabled("investigation")}
                                    onChange={(p) => patchAction("investigation", p)}
                                />
                            </>
                        )}
                    </Paper>

                    <Box sx={{ display: "flex", justifyContent: "center", color: "text.disabled", lineHeight: 1 }}>▼</Box>

                    {/* 4 – Report generation */}
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                        <StepHeader
                            index={4} label="Report Generation"
                            enabled={settings.report_generation.enabled}
                            locked={isLocked("report_generation")}
                            onToggle={(v) => setActionEnabled("report_generation", v)}
                        />
                        {settings.report_generation.enabled && (
                            <>
                                <ReportFields
                                    settings={settings.report_generation}
                                    templateIds={reportTemplates}
                                    disabled={actionDisabled("report_generation")}
                                    onChange={(p) => patchAction("report_generation", p)}
                                />
                                <CommonActionFields
                                    settings={settings.report_generation}
                                    disabled={actionDisabled("report_generation")}
                                    onChange={(p) => patchAction("report_generation", p)}
                                />
                            </>
                        )}
                    </Paper>
                </Box>

                {/* ── Feedback ── */}
                {loading && (
                    <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 1 }}>
                        <CircularProgress size={18} />
                        <Typography variant="body2">Loading…</Typography>
                    </Box>
                )}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={save}
                        disabled={loading || saving}
                    >
                        {saving ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                        Save
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};
