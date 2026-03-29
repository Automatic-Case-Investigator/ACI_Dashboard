import { Box, Collapse, IconButton, Menu, MenuItem, Paper, Tooltip, Typography } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MarkdownPreview from '@uiw/react-markdown-preview';
import Editor from '@monaco-editor/react';
import DoneIcon from '@mui/icons-material/Done';
import { darkTheme } from "../../themes/darkTheme";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { TaskData, TaskLogData } from "../../types/types";

interface TaskLogSectionProps {
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
    onMenuOpen: (event: React.MouseEvent<HTMLButtonElement>, logId: string) => void;
    onMenuClose: (logId: string) => void;
    onInvestigate: (message: string, logId: string) => void;
    onDelete: (logId: string) => void;
    onEditingChange: (logId: string, value: string | undefined) => void;
}

export const TaskLogSection: React.FC<TaskLogSectionProps> = ({
    taskData,
    taskLogs,
    openLogIndexes,
    editingLogs,
    logSaving,
    copySuccessId,
    menuAnchorEl,
    onToggleLogOpen,
    onStartEdit,
    onSave,
    onCancelEdit,
    onCopy,
    onMenuOpen,
    onMenuClose,
    onInvestigate,
    onDelete,
    onEditingChange,
}) => {
    return (
        <>
            <Typography variant="h6" sx={{ mt: 2 }}>Task Log:</Typography>
            <Box sx={{ flex: 1, overflow: "auto" }}>
                {taskLogs && taskLogs.length > 0 ? (
                    taskLogs.map((log, index) => {
                        const isOpen = openLogIndexes.includes(index);
                        const isEditing = Object.prototype.hasOwnProperty.call(editingLogs, log.id);
                        return (
                            <Paper key={index} sx={{ padding: 1, margin: 1, overflowX: "scroll", width: "100%" }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                                        <IconButton
                                            onClick={() => onToggleLogOpen(index)}
                                            aria-label={isOpen ? "Collapse" : "Expand"}
                                            size="small"
                                            sx={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                                        >
                                            <ExpandMoreIcon />
                                        </IconButton>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography sx={{ display: "inline-block" }}>{log.createdBy}</Typography>
                                                <Typography sx={{ display: "inline-block", color: "weak.main" }}>{new Date(taskData.createdAt).toString()}</Typography>
                                            </Box>
                                            {!isOpen && (
                                                <Typography
                                                    sx={{
                                                        color: "weak.main",
                                                        fontSize: "0.875rem",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        mt: 0.5
                                                    }}
                                                >
                                                    {log.message.split('\n')[0]}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {isEditing ? (
                                            <Box sx={{
                                                display: 'flex',
                                                gap: 0.5,
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                            }}>
                                                <Tooltip title="Save changes" placement="top">
                                                    <IconButton
                                                        onClick={async () => await onSave(log.id)}
                                                        size="small"
                                                        disabled={logSaving}
                                                        sx={{ color: 'success.main' }}
                                                    >
                                                        <SaveIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Cancel editing" placement="top">
                                                    <IconButton
                                                        onClick={() => onCancelEdit(log.id)}
                                                        size="small"
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        ) : (
                                            <>
                                                <Tooltip title="Edit this log" placement="top">
                                                    <IconButton
                                                        onClick={() => onStartEdit(log.id, index, log.message)}
                                                        size="small"
                                                        color="primary"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={copySuccessId === log.id ? "Copied!" : "Copy to clipboard"} placement="top">
                                                    <IconButton
                                                        onClick={() => onCopy(log.message, log.id)}
                                                        size="small"
                                                        color={copySuccessId === log.id ? "success" : "default"}
                                                    >
                                                        {copySuccessId === log.id ? <DoneIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="More actions" placement="top">
                                                    <IconButton
                                                        onClick={(e) => onMenuOpen(e, log.id)}
                                                        size="small"
                                                    >
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Menu
                                                    anchorEl={menuAnchorEl[log.id] || null}
                                                    open={Boolean(menuAnchorEl[log.id])}
                                                    onClose={() => onMenuClose(log.id)}
                                                >
                                                    <MenuItem onClick={() => onInvestigate(log.message, log.id)}>
                                                        <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                                                        Investigate
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => onDelete(log.id)}
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                                                        Delete
                                                    </MenuItem>
                                                </Menu>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                                <Collapse in={isOpen}>
                                    {isEditing ? (
                                        <Box
                                            sx={{
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                overflow: 'auto',
                                                resize: 'vertical',
                                                height: 240,
                                                minHeight: 160,
                                                maxHeight: '70vh',
                                                mt: 1,
                                            }}
                                        >
                                            <Editor
                                                key={`task-log-editor-${log.id}`}
                                                path={`task-log-${log.id}.md`}
                                                height="100%"
                                                defaultLanguage="markdown"
                                                value={editingLogs[log.id]}
                                                onChange={(value) => onEditingChange(log.id, value)}
                                                theme="vs-dark"
                                                options={{
                                                    minimap: { enabled: false },
                                                    scrollBeyondLastLine: false,
                                                    wordWrap: 'on',
                                                    lineNumbers: 'off',
                                                    folding: false,
                                                    automaticLayout: true,
                                                    fontSize: 14,
                                                }}
                                            />
                                        </Box>
                                    ) : (
                                        <MarkdownPreview
                                            source={log.message}
                                            style={{
                                                width: "calc(100vw - 150px)",
                                                background: "transparent",
                                                color: darkTheme.palette.primary.main,
                                                fontSize: "1rem"
                                            }}
                                            components={{
                                                a: ({ children, className, ...props }) =>
                                                    className && className.includes('anchor') ?
                                                        <a style={{ display: "none" }}>{children}</a> :
                                                        <a className={className} {...props}>{children}</a>
                                            }}
                                        />
                                    )}
                                </Collapse>
                            </Paper>
                        );
                    })
                ) : (
                    <Typography sx={{ color: "weak.main" }}>No task logs have been found</Typography>
                )}
            </Box>
        </>
    );
};