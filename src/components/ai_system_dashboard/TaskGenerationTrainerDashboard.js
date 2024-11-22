import { Box, Button, Divider, TextField, Typography } from "@mui/material";
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
    const [trainErrorMessage, setTrainErrorMessage] = useState("");
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
    const [learningRate, setLearningRate] = useState(2e-4);
    const [gradientAccumulationSteps, setGradientAccumulationSteps] = useState(4);
    const [weightDecay, setWeightDecay] = useState(0.0001);

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
        const orgsResponse = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/get_organizations/?soar_id=${targetSOAR.id}`);
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
            const casesResponse = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/get_cases/?soar_id=${targetSOAR.id}&org_id=${org.id}`);
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
        if (selectedItems.length === 0) {
            setTrainErrorMessage("No data is selected");
        }

        for (let id of selectedItems) {
            if (!caseIds.includes(id)) {
                continue;
            }

            const response = await fetch(process.env.REACT_APP_BACKEND_URL + `soar/get_tasks/?soar_id=${targetSOAR.id}&case_id=${id}`);
            const rawData = await response.json();

            if (rawData["error"]) {
                setTrainErrorMessage(rawData["error"])
            } else {
                setTrainErrorMessage("")
                await fetch(
                    process.env.REACT_APP_BACKEND_URL + `ai_backend/add_case_data/`,
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
    }

    useEffect(() => {
        buildCaseDataForest();
    }, []);

    useEffect(() => {
        console.log(selectedItems);
    }, [selectedItems]);

    useEffect(() => {
        console.log(caseDataForest);
    }, [caseDataForest]);

    return (
        <>
            <Typography variant="h6">Task Generation</Typography>
            {
                overallErrorMessage && <Typography variant="body1">{overallErrorMessage}</Typography>
            }
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
            <Divider sx={{ paddingTop: 1, marginBottom: 2 }} />
            <Button variant="outlined" color="secondary" onClick={trainModel}>Train</Button>
            {
                trainErrorMessage && <Typography variant="body1">{trainErrorMessage}</Typography>
            }
        </>
    )
}