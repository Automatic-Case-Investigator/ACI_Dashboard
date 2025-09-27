import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRef, useState } from "react";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { useCookies } from "react-cookie";
import { ActivityGenModelSelect } from "./modals/ActivityGenModelSelect";
import { INFO } from "../../constants/model-info";
import { CaseDataForest } from "../../types/types";

interface TreeViewApi {
    getItem: (id: string) => CaseDataForest | undefined;
}

interface ActivityGenerationTrainerDashboardProps {
    caseIds: string[];
    caseOrgIds: Record<string, string>;
    caseDataForest: CaseDataForest[];
}

/**
 * A dashboard for managing the activity generation model
 * @param {object} props
 * @property caseIds        - an array of case ids
 * @property caseOrdIds     - a dictionary that maps a case id to an org id
 * @property caseDataForest - a list of objects containing the organization and case information
 */
export const ActivityGenerationTrainerDashboard: React.FC<ActivityGenerationTrainerDashboardProps> = ({ 
    caseDataForest 
}) => {
    const [cookies, _setCookies, removeCookies] = useCookies(["token"]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [selectedModelIdx, setSelectedModelIdx] = useState<number>(0);

    // snackbar states
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarSuccessful, setSnackbarSuccessful] = useState<boolean>(true);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");

    // modal states
    const [modelSelectOpen, setModelSelectOpen] = useState<boolean>(false);

    const toggledItemRef = useRef<Record<string, boolean>>({});
    const apiRef = useRef<TreeViewApi | undefined>(undefined);

    function getItemDescendantsIds(item: CaseDataForest): string[] {
        const ids: string[] = [];
        item.children?.forEach((child: CaseDataForest) => {
            ids.push(child.id);
            ids.push(...getItemDescendantsIds(child));
        });
        return ids;
    }

    const handleItemSelectionToggle = (
        _event: React.SyntheticEvent,
        itemId: string,
        isSelected: boolean
    ) => {
        toggledItemRef.current[itemId] = isSelected;
    };

    const handleSelectedItemsChange = (
        _event: React.SyntheticEvent,
        newSelectedItems: string[]
    ) => {
        setSelectedItems(newSelectedItems);

        // Select / unselect the children of the toggled item
        const itemsToSelect: string[] = [];
        const itemsToUnSelect: Record<string, boolean> = {};
        
        Object.entries(toggledItemRef.current).forEach(([itemId, isSelected]) => {
            const item = apiRef.current?.getItem(itemId);
            if (!item) return;

            if (isSelected) {
                itemsToSelect.push(...getItemDescendantsIds(item));
            } else {
                getItemDescendantsIds(item).forEach((descendantId) => {
                    itemsToUnSelect[descendantId] = true;
                });
            }
        });

        const newSelectedItemsWithChildren = Array.from(
            new Set(
                [...newSelectedItems, ...itemsToSelect].filter(
                    (itemId) => !itemsToUnSelect[itemId]
                )
            )
        );

        setSelectedItems(newSelectedItemsWithChildren);
        toggledItemRef.current = {};
    };

    const loadBaseline = async () => {
        const modelId = INFO.ACTIVITY_GENERATION[selectedModelIdx].ID;
        const requestBody = new FormData();
        requestBody.append("model_id", modelId);

        try {
            const response = await fetch(
                process.env.REACT_APP_BACKEND_URL + `ai_backend/automatic_investigation/activity_generation_model/restore_baseline/`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${cookies.token}`
                    },
                    body: requestBody
                }
            );
            const rawData = await response.json();

            if (rawData.code && rawData.code === "token_not_valid") {
                removeCookies("token");
                return;
            }

            if (rawData.message === "Success") {
                setSnackbarMessage("Successfully created model reset job. Check jobs page for details.");
                setSnackbarSuccessful(true);
            } else {
                setSnackbarMessage("You already have one model reset job. Please wait for the job to be finished.");
                setSnackbarSuccessful(false);
            }
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage("Failed to load baseline model");
            setSnackbarSuccessful(false);
            setSnackbarOpen(true);
            console.error("Error loading baseline:", error);
        }
    }

    return (
        <Box>
            <Typography variant="h6">Activity Generation</Typography>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={5000}
                onClose={() => setSnackbarOpen(false)}>
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSuccessful ? "success" : "error"}
                    variant="filled"
                    sx={{ width: '100%', color: "primary.main" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    Model Training
                </AccordionSummary>
                <AccordionDetails>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            Data Selection
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography color="textSecondary" sx={{ padding: 1, fontStyle: "italic" }}>
                                Caution: please make sure that each task log entry of the task is a short description of an investigation activity.
                            </Typography>
                            <RichTreeView
                                items={caseDataForest}
                                multiSelect
                                checkboxSelection
                                apiRef={apiRef}
                                selectedItems={selectedItems}
                                onSelectedItemsChange={handleSelectedItemsChange}
                                onItemSelectionToggle={handleItemSelectionToggle}
                                sx={{
                                    "& .MuiCheckbox-root": {
                                        "&.Mui-checked": {
                                            color: "secondary.main",
                                        },
                                    }
                                }}
                            />
                        </AccordionDetails>
                    </Accordion>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    Model Status
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>Reset to baseline model</Typography>
                    <ActivityGenModelSelect 
                        onSave={(idx: number) => setSelectedModelIdx(idx)} 
                        open={modelSelectOpen} 
                        onClose={() => setModelSelectOpen(false)} 
                    />
                    <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => setModelSelectOpen(true)}
                    >
                        Select Model
                    </Button>
                    <Box sx={{ m: 1 }} />
                    <Typography variant="body2" color="warning" sx={{ fontStyle: "italic" }}>
                        By clicking the button below, you will reset your model to the pre-trained state.
                    </Typography>
                    <Box sx={{ paddingTop: 1, display: "flex", gap: 1 }}>
                        <Button 
                            variant="outlined" 
                            color="warning" 
                            size="small" 
                            onClick={loadBaseline}
                        >
                            Download Baseline
                        </Button>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};