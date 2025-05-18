import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Snackbar, Typography } from "@mui/material"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRef, useState } from "react";
import { useTreeViewApiRef } from "@mui/x-tree-view/hooks";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { useCookies } from "react-cookie";

/**
 * A dashboard for managing the task generation model
 * @param {object} props
 * @property caseIds        - an array of case ids
 * @property caseOrdIds     - a dictionary that maps a case id to an org id
 * @property caseDataForest - a list of objects containing the organization and case information
 */
export const QueryGenerationTrainerDashboard = ({ caseIds, caseOrgIds, caseDataForest }) => {
    const [cookies, setCookies, removeCookies] = useCookies(["token"]);
    const [selectedItems, setSelectedItems] = useState([]);

    // snackbar states
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarSuccessful, setSnackbarSuccessful] = useState(true);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const toggledItemRef = useRef({});
    const apiRef = useTreeViewApiRef();

    function getItemDescendantsIds(item) {
        const ids = [];
        item.children?.forEach((child) => {
            ids.push(child.id);
            ids.push(...getItemDescendantsIds(child));
        });

        return ids;
    }

    const handleItemSelectionToggle = (event, itemId, isSelected) => {
        toggledItemRef.current[itemId] = isSelected;
    };

    const handleSelectedItemsChange = (event, newSelectedItems) => {
        setSelectedItems(newSelectedItems);

        // Select / unselect the children of the toggled item
        const itemsToSelect = [];
        const itemsToUnSelect = {};
        Object.entries(toggledItemRef.current).forEach(([itemId, isSelected]) => {
            const item = apiRef.current.getItem(itemId);
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
                    (itemId) => !itemsToUnSelect[itemId],
                ),
            ),
        );

        setSelectedItems(newSelectedItemsWithChildren);

        toggledItemRef.current = {};
    };

    const loadBaseline = async () => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `ai_backend/automatic_investigation/query_generation_model/restore_baseline/`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                }
            }
        );
        const rawData = await response.json();

        if (rawData.code && rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }
        
        if (rawData["message"] === "Success") {
            setSnackbarMessage("Successfully created model reset job. Check jobs page for details.");
            setSnackbarSuccessful(true);
            setSnackbarOpen(true);
        } else {
            setSnackbarMessage("You already have one model reset job. Please wait for the job to be finished.");
            setSnackbarSuccessful(false);
            setSnackbarOpen(true);
        }
    }

    return (
        <Box>
            <Typography variant="h6">Query Generation</Typography>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={5000}
                onClose={() => { setSnackbarOpen(false) }}>
                <Alert
                    onClose={() => { setSnackbarOpen(false) }}
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
                            <Typography color="weak" sx={{ padding: 1, fontStyle: "italic" }}>Caution: please make sure that each task log entry of the task is a short description of an investigation activity.</Typography>
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
                                }} />
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
                    <Typography variant="body2" color="warning" sx={{ fontStyle: "italic" }}>By clicking the button below, you will reset your model to the pre-trained state.</Typography>
                    <Box sx={{ paddingTop: 1, display: "flex", gap: 1 }}>
                        <Button variant="outlined" color="warning" size="small" onClick={loadBaseline}>Load baseline</Button>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}