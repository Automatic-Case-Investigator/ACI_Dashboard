import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TabPanel from '@mui/lab/TabPanel';

export interface WebSearchEnableState {
    task_generation: boolean;
    activity_generation: boolean;
    siem_investigation: boolean;
}

interface CaseAutomationsTabProps {
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
    additionalNotes: string;
    setAdditionalNotes: (value: string) => void;
    correctEarliestMagnitude: () => number;
    correctVicinityMagnitude: () => number;
    correctMaxIterations: () => number;
    onGenerateTask: () => void;
    onGenerateActivity: () => void;
    onInvestigateTask: () => void;
}

export const CaseAutomationsTab: React.FC<CaseAutomationsTabProps> = ({
    enableWebSearch,
    setEnableWebSearch,
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
    additionalNotes,
    setAdditionalNotes,
    correctEarliestMagnitude,
    correctVicinityMagnitude,
    correctMaxIterations,
    onGenerateTask,
    onGenerateActivity,
    onInvestigateTask,
}) => {
    return (
        <TabPanel value="4">
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">Task Generation</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                        This is responsible for generating high-level investigation objectives for understanding the cause of the security case and correlating relevant events.
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, ml: 1, mb: 2 }}>
                        <FormControlLabel
                            label="Enable Web Search"
                            control={
                                <Checkbox
                                    color="secondary"
                                    checked={enableWebSearch.task_generation}
                                    onChange={() => setEnableWebSearch({ ...enableWebSearch, task_generation: !enableWebSearch.task_generation })}
                                />
                            }
                        />
                        <Typography variant="caption" color="text.secondary">
                            Allows the system to perform smart internet searches and gather up-to-date knowledge as context. This increases the amount of time required as it performs smart searches and text summarization.
                        </Typography>
                    </Box>
                    <Button size="small" variant="outlined" color="secondary" onClick={onGenerateTask}>Run</Button>
                </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">Activity Generation</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                        This is responsible for generating more in-depth sub-activities of each task.
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, ml: 1, mb: 2 }}>
                        <FormControlLabel
                            label="Enable Web Search"
                            control={
                                <Checkbox
                                    color="secondary"
                                    checked={enableWebSearch.activity_generation}
                                    onChange={() => setEnableWebSearch({ ...enableWebSearch, activity_generation: !enableWebSearch.activity_generation })}
                                />
                            }
                        />
                        <Typography variant="caption" color="text.secondary">
                            Allows the system to perform smart internet searches and gather up-to-date knowledge as context. This increases the amount of time required as it performs smart searches and text summarization.
                        </Typography>
                    </Box>
                    <Button size="small" variant="outlined" color="secondary" onClick={onGenerateActivity}>Run</Button>
                </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">Automatic Investigation</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                        This is responsible for automatically querying the SIEM and correlating security events to perform investigation. This must be used with activities existing in the case. This can be achieved by either enabling the activity generation or manually writing down investigation activities.
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, ml: 1, mb: 2 }}>
                        <FormControlLabel
                            label="Enable Web Search"
                            control={
                                <Checkbox
                                    color="secondary"
                                    checked={enableWebSearch.siem_investigation}
                                    onChange={() => setEnableWebSearch({ ...enableWebSearch, siem_investigation: !enableWebSearch.siem_investigation })}
                                />
                            }
                        />
                        <Typography mb={2} variant="caption" color="text.secondary">
                            Allows the system to perform smart internet searches and gather up-to-date knowledge as context. This increases the amount of time required as it performs smart searches and text summarization.
                        </Typography>

                        <Typography mb={1}>Earliest events from now to look up:</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
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
                        <Box mb={1} />
                        <Typography mb={1}>Time window for events in vicinity:</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
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
                        <Box mb={1} />
                        <Typography mb={1}>Maximum iterations for investigation</Typography>
                        <TextField
                            size="small"
                            value={maxIterations}
                            onChange={(e) => setMaxIterations(e.target.value === "" ? "" : Number(e.target.value))}
                            onBlur={correctMaxIterations}
                            type="number"
                            sx={{
                                width: '60px',
                                mb: 2,
                                '& input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
                                '& input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                                '& input[type=number]': { MozAppearance: 'textfield' },
                            }}
                        />

                        <Typography mb={1}>Additional Notes</Typography>
                        <TextField
                            size="small"
                            placeholder="additional notes for the investigation"
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            multiline
                            minRows={2}
                            sx={{ width: '100%' }}
                        />
                    </Box>
                    <Button size="small" variant="outlined" color="secondary" onClick={onInvestigateTask}>Run</Button>
                </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">Report Generation</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                        (Coming soon) With the investigation results on the SOAR, the system generates a report summarizing the investigation process, findings, and recommended next steps.
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </TabPanel>
    );
};