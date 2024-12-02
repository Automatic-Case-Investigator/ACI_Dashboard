import { Alert, Box, Button, Divider, Snackbar, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const TaskGenerationTrainerDashboard = () => {
    const [caseIds, setCaseIds] = useState([]);
    const [caseOrgIds, setCaseOrgIds] = useState({});
    const [caseDataForest, setCaseDataForest] = useState([]);
    const [overallErrorMessage, setOverallErrorMessage] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const toggledItemRef = useRef({});
    const apiRef = useTreeViewApiRef();
    const [targetSOAR, setTargetSOAR] = useState(() => {
        const saved = localStorage.getItem("targetSOAR");
        const initialValue = JSON.parse(saved);
        return initialValue || null;
    });

    // hyperparameter setting
    const [seed, setSeed] = useState(3407);
    const [maxSteps, setMaxSteps] = useState(100);
    const [learningRate, setLearningRate] = useState(2e-4);
    const [gradientAccumulationSteps, setGradientAccumulationSteps] = useState(4);
    const [weightDecay, setWeightDecay] = useState(0.0001);

    // snackbar states
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarSuccessful, setSnackbarSuccessful] = useState(true);
    const [snackbarMessage, setSnackbarMessage] = useState("");

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

    const buildCaseDataForest = async () => {
        const orgsResponse = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/organizations/?soar_id=${targetSOAR.id}`);
        const orgsRawData = await orgsResponse.json();
        let updatedCaseDataForest = [];
        let fetchedCaseIds = [];
        let updatedCaseOrgIds = {};

        if (orgsRawData["error"]) {
            setOverallErrorMessage(orgsRawData["error"])
            return;
        }

        for (let org of orgsRawData["organizations"]) {
            updatedCaseDataForest.push({
                id: org.id,
                label: `${org.name} (${org.id})`,
                children: [],
            });
            const casesResponse = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/case/?soar_id=${targetSOAR.id}&org_id=${org.id}`);
            const casesRawData = await casesResponse.json();

            if (casesRawData["error"]) {
                setOverallErrorMessage(casesRawData["error"]);
                return;
            }
            updatedCaseDataForest[updatedCaseDataForest.length - 1].children = casesRawData["cases"].map((caseData) => ({
                id: caseData.id,
                label: `${caseData.title} (${caseData.id})`,
                title: caseData.title,
                description: caseData.description
            }));

            for (let caseData of casesRawData["cases"]) {
                fetchedCaseIds.push(caseData.id);
                updatedCaseOrgIds[caseData.id] = org.id;
            }
        }
        setCaseIds(fetchedCaseIds);
        setCaseOrgIds(updatedCaseOrgIds);
        setCaseDataForest(updatedCaseDataForest);
    }

    const trainModel = async () => {
        for (let id of selectedItems) {
            if (!caseIds.includes(id)) {
                continue;
            }

            const response = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/task/?soar_id=${targetSOAR.id}&case_id=${id}`);
            const rawData = await response.json();

            if (rawData["error"]) {
            } else {
                await fetch(
                    process.env.REACT_APP_BACKEND_URL + `ai_backend/task_generation_model/case_tmp_storage/`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            id: caseDataForest.filter((org) => org.id === caseOrgIds[id])[0].id,
                            title: caseDataForest.filter((org) => org.id === caseOrgIds[id])[0].children.filter((child) => child.id === id)[0].title,
                            description: caseDataForest.filter((org) => org.id === caseOrgIds[id])[0].children.filter((child) => child.id === id)[0].description,
                            tasks: rawData["tasks"],
                        })
                    }
                );
            }
        }
        const requestBody = new FormData();
        requestBody.append("seed", seed);
        requestBody.append("max_steps", maxSteps);
        requestBody.append("learning_rate", learningRate);
        requestBody.append("gradient_accumulation_steps", gradientAccumulationSteps);
        requestBody.append("weight_decay", weightDecay);

        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `ai_backend/task_generation_model/train_model/`,
            {
                method: "POST",
                body: requestBody
            }
        );
        const rawData = await response.json();
        if (rawData["message"] === "Success") {
            setSnackbarMessage("Successfully created model training job. Check jobs page for details.");
            setSnackbarSuccessful(true);
            setSnackbarOpen(true);
        } else {
            setSnackbarMessage("You already have one model training job. Please wait for the job to be finished.");
            setSnackbarSuccessful(false);
            setSnackbarOpen(true);
        }
    }

    const loadBaseline = async () => {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + `ai_backend/task_generation_model/restore_baseline/`, { method: "POST" });
        const rawData = await response.json();
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

    useEffect(() => {
        buildCaseDataForest();
    }, []);

    return (
        <>
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
            <Typography variant="h6">Task Generation</Typography>
            {
                overallErrorMessage && <Typography variant="body1">{overallErrorMessage}</Typography>
            }
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    Train on custom data
                </AccordionSummary>
                <AccordionDetails>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            Data Selection
                        </AccordionSummary>
                        <AccordionDetails>
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
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            Hyper Parameters
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <Typography variant="body1" sx={{ display: "inline-block", width: "30vw" }}>Seed:</Typography>
                                <TextField size="small" value={seed} onInput={(e) => setSeed(+e.target.value)} />
                            </Box>
                            <br />
                            <Box>
                                <Typography variant="body1" sx={{ display: "inline-block", width: "30vw" }}>Max steps:</Typography>
                                <TextField size="small" value={maxSteps} onInput={(e) => setMaxSteps(+e.target.value)} />
                            </Box>
                            <br />
                            <Box>
                                <Typography variant="body1" sx={{ display: "inline-block", width: "30vw" }}>Learning Rate:</Typography>
                                <TextField size="small" value={learningRate} onInput={(e) => setLearningRate(+e.target.value)} />
                            </Box>
                            <br />
                            <Box>
                                <Typography variant="body1" sx={{ display: "inline-block", width: "30vw" }}>Gradient Accumulation Steps:</Typography>
                                <TextField size="small" value={gradientAccumulationSteps} onInput={(e) => setGradientAccumulationSteps(+e.target.value)} />
                            </Box>
                            <br />
                            <Box>
                                <Typography variant="body1" sx={{ display: "inline-block", width: "30vw" }}>Weight Decay:</Typography>
                                <TextField size="small" value={weightDecay} onInput={(e) => setWeightDecay(+e.target.value)} />
                            </Box>
                            <br />
                        </AccordionDetails>
                    </Accordion>
                    <Box sx={{ paddingTop: 1, display: "flex", gap: 1 }}>
                        <Button variant="outlined" color="secondary" size="small" onClick={trainModel}>Train</Button>
                    </Box>

                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    Reset baseline model
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>By clicking the button below, you will reset your model to the pre-trained state.</Typography>
                    <Box sx={{ paddingTop: 1, display: "flex", gap: 1 }}>
                        <Button variant="outlined" color="warning" size="small" onClick={loadBaseline}>Load baseline</Button>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </>
    )
}