import { Box, Button, Modal, Paper, Typography } from "@mui/material";
import TokenIcon from "@mui/icons-material/Token";
import { useState } from "react";
import { INFO } from "../../../constants/model-info";
import { CallbackFunction, ModelInfo } from "../../../types/types";

interface TaskGenModelSelectProps {
    open: boolean;
    onClose: CallbackFunction;
    onSave: CallbackFunction;
}

const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
};

export const TaskGenModelSelect: React.FC<TaskGenModelSelectProps> = ({ open, onClose, onSave }) => {
    const [selectedModelIdx, setSelectedModelIdx] = useState<number>(0);
    const models: ModelInfo[] = INFO.TASK_GENERATION;

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    Select a Model
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {models.map((entry, idx) => (
                        <Paper
                            key={idx}
                            elevation={selectedModelIdx === idx ? 10 : 1}
                            onClick={() => setSelectedModelIdx(idx)}
                            sx={{
                                p: 1,
                                cursor: "pointer",
                                borderRadius: 2,
                                transition: "all 0.1s ease-in-out",
                                '&:hover': {
                                    boxShadow: 4,
                                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                                },
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <TokenIcon />
                                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                    {entry.NAME}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Model Size: {entry.SIZE}
                            </Typography>
                        </Paper>
                    ))}
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => {
                            onSave(selectedModelIdx);
                            onClose();
                        }}
                    >
                        Save
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};
