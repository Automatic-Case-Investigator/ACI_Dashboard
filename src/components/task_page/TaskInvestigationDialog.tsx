import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { TaskInvestigationDialogProps } from "../../types/types";

export const TaskInvestigationDialog: React.FC<TaskInvestigationDialogProps> = ({
    open,
    onClose,
    webSearchEnabled,
    setWebSearchEnabled,
    earliestMagnitude,
    setEarliestMagnitude,
    earliestUnit,
    setEarliestUnit,
    vicinityMagnitude,
    setVicinityMagnitude,
    vicinityUnit,
    setVicinityUnit,
    maxIterations,
    setMaxIterations,
    maxQueriesPerIteration,
    setMaxQueriesPerIteration,
    additionalNotes,
    setAdditionalNotes,
    correctEarliestMagnitude,
    correctVicinityMagnitude,
    correctMaxIterations,
    correctMaxQueriesPerIteration,
    onInvestigate,
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Investigate Task Log</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Adjust the investigation parameters for this task log.
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <FormControlLabel
                        label="Enable Web Search"
                        control={
                            <Checkbox
                                color="secondary"
                                checked={webSearchEnabled}
                                onChange={(e) => setWebSearchEnabled(e.target.checked)}
                            />
                        }
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: -1, mb: 1 }}>
                        Allows the system to perform smart internet searches and gather up-to-date knowledge as context.
                    </Typography>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Earliest events from now to look up:</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <TextField
                                size="small"
                                type="number"
                                placeholder="0"
                                value={earliestMagnitude}
                                onBlur={correctEarliestMagnitude}
                                onChange={(e) => setEarliestMagnitude(e.target.value === "" ? "" : Number(e.target.value))}
                                sx={{ width: 100 }}
                            />
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Unit</InputLabel>
                                <Select
                                    value={earliestUnit}
                                    label="Unit"
                                    onChange={(e) => setEarliestUnit(e.target.value)}
                                >
                                    <MenuItem value="hours">Hours</MenuItem>
                                    <MenuItem value="days">Days</MenuItem>
                                    <MenuItem value="weeks">Weeks</MenuItem>
                                    <MenuItem value="months">Months</MenuItem>
                                    <MenuItem value="years">Years</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Time window for events in vicinity:</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <TextField
                                size="small"
                                type="number"
                                placeholder="0"
                                value={vicinityMagnitude}
                                onBlur={correctVicinityMagnitude}
                                onChange={(e) => setVicinityMagnitude(e.target.value === "" ? "" : Number(e.target.value))}
                                sx={{ width: 100 }}
                            />
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Unit</InputLabel>
                                <Select
                                    value={vicinityUnit}
                                    label="Unit"
                                    onChange={(e) => setVicinityUnit(e.target.value)}
                                >
                                    <MenuItem value="minutes">Minutes</MenuItem>
                                    <MenuItem value="hours">Hours</MenuItem>
                                    <MenuItem value="days">Days</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Maximum iterations for investigation:</Typography>
                        <TextField
                            size="small"
                            value={maxIterations}
                            onChange={(e) => setMaxIterations(e.target.value === "" ? "" : Number(e.target.value))}
                            onBlur={correctMaxIterations}
                            type="number"
                            sx={{
                                width: '100px',
                                '& input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
                                '& input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                                '& input[type=number]': { MozAppearance: 'textfield' },
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Maximum queries to generate per iteration:</Typography>
                        <TextField
                            size="small"
                            value={maxQueriesPerIteration}
                            onChange={(e) => setMaxQueriesPerIteration(e.target.value === "" ? "" : Number(e.target.value))}
                            onBlur={correctMaxQueriesPerIteration}
                            type="number"
                            inputProps={{ max: 20 }}
                            sx={{
                                width: '100px',
                                '& input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
                                '& input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                                '& input[type=number]': { MozAppearance: 'textfield' },
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Additional Notes</Typography>
                        <TextField
                            size="small"
                            multiline
                            minRows={2}
                            placeholder="additional notes for the investigation"
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            fullWidth
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onInvestigate} variant="contained" color="secondary">Investigate</Button>
            </DialogActions>
        </Dialog>
    );
};