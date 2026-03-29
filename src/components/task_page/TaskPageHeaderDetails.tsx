import { Box, IconButton, Typography, Divider } from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { TaskData } from "../../types/types";
import { darkTheme } from "../../themes/darkTheme";

interface TaskPageHeaderDetailsProps {
    taskData: TaskData;
    onBack: () => void;
}

export const TaskPageHeaderDetails: React.FC<TaskPageHeaderDetailsProps> = ({ taskData, onBack }) => {
    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton
                    size="small"
                    edge="start"
                    onClick={onBack}
                    sx={{ mr: 1 }}
                >
                    <ArrowBackIosIcon fontSize="small" />
                </IconButton>
                <Typography variant="h6">{taskData.title}</Typography>
            </Box>
            <Box sx={{ flexDirection: 'row' }}>
                <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>ID:</b></Typography>
                <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{taskData.id}</Typography>
                <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>Created At:</b></Typography>
                <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{new Date(taskData.createdAt).toString()}</Typography>
                <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>Created By:</b></Typography>
                <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{taskData.createdBy}</Typography>
                <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>Group:</b></Typography>
                <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{taskData.group}</Typography>
                <Typography sx={{ display: "inline-block", paddingRight: 1 }} variant="body2"><b>Status:</b></Typography>
                <Typography sx={{ display: "inline-block", paddingRight: 1, color: "weak.main" }} variant="body2">{taskData.status}</Typography>
                <Divider sx={{ paddingTop: 1, marginBottom: 1 }} />

                <Typography variant="h6">Description:</Typography>
                <MarkdownPreview
                    source={taskData.description}
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
                <Divider sx={{ paddingTop: 1, marginBottom: 1 }} />
            </Box>
        </>
    );
};