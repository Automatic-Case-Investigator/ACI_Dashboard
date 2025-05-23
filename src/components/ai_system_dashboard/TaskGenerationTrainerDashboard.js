import { Alert, Box, Button, IconButton, Paper, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { BACKUP_PAGE_SIZE } from "../../constants/page-sizes";
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from "@mui/icons-material/Delete";
import Pagination from '@mui/material/Pagination';
import { TaskGenModelSelect } from "./modals/TaskGenModelSelect";
import { INFO } from "../../constants/model-info";
import { useCookies } from "react-cookie";

/**
 * A dashboard for managing the task generation model
 * @param {object} props
 * @property caseIds        - an array of case ids
 * @property caseOrdIds     - a dictionary that maps a case id to an org id
 * @property caseDataForest - a list of objects containing the organization and case information
 */
export const TaskGenerationTrainerDashboard = ({ caseIds, caseOrgIds, caseDataForest }) => {
    const [cookies, setCookies, removeCookies] = useCookies(["token"]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedModelIdx, setSelectedModelIdx] = useState(0);
    const [backupHistoryPageNumber, setBackupHistoryPageNumber] = useState(0);
    const [backupHistory, setBackupHistory] = useState([]);
    const [backupHistoryPagesTotal, setBackupHistoryPagesTotal] = useState(0);
    const [currentVersion, setCurrentVersion] = useState("");

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

    // modal states
    const [modelSelectOpen, setModelSelectOpen] = useState(false);

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

    const trainModel = async () => {
        for (let id of selectedItems) {
            if (!caseIds.includes(id)) {
                continue;
            }

            const response = await fetch(
                process.env.REACT_APP_BACKEND_URL + `soar/task/?soar_id=${targetSOAR.id}&case_id=${id}`,
                {
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

            if (rawData["error"]) {
            } else {
                const response = await fetch(
                    process.env.REACT_APP_BACKEND_URL + `ai_backend/task_generation_model/case_tmp_storage/`,
                    {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${cookies.token}`
                        },
                        body: JSON.stringify({
                            id: caseDataForest.filter((org) => org.id === caseOrgIds[id])[0].id,
                            title: caseDataForest.filter((org) => org.id === caseOrgIds[id])[0].children.filter((child) => child.id === id)[0].title,
                            description: caseDataForest.filter((org) => org.id === caseOrgIds[id])[0].children.filter((child) => child.id === id)[0].description,
                            tasks: rawData["tasks"],
                        })
                    }
                );

                const responseJson = await response.json();
                if (responseJson.code && responseJson.code === "token_not_valid") {
                    removeCookies("token");
                    return;
                }
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
        const modelId = INFO.TASK_GENERATION[selectedModelIdx].ID;
        const requestBody = new FormData();
        requestBody.append("model_id", modelId);

        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `ai_backend/task_generation_model/restore_baseline/`,
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

    const getBackupHistory = async (pageNumber) => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `ai_backend/task_generation_model/history/?page=${pageNumber}`,
            {
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                },
            }
        );
        const rawData = await response.json();
        if (rawData.code && rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }
        if (rawData.message && rawData.message === "Success") {
            const entriesRemaining = rawData.total_count % BACKUP_PAGE_SIZE;
            setBackupHistory(rawData.entries);
            if (entriesRemaining) {
                setBackupHistoryPagesTotal(Math.floor(rawData.total_count / BACKUP_PAGE_SIZE) + 1)
            } else {
                setBackupHistoryPagesTotal(Math.floor(rawData.total_count / BACKUP_PAGE_SIZE))
            }
        }
    }

    const backupModel = async () => {
        setSnackbarMessage("Creating a backup of the current model");
        setSnackbarSuccessful(true);
        setSnackbarOpen(true);
        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `ai_backend/task_generation_model/backup/`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                },
            }
        );
        const rawData = await response.json();
        if (rawData.code && rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }

        if (rawData.message) {
            setSnackbarMessage("Backup successful");
            setSnackbarSuccessful(true);
            setSnackbarOpen(true);
        }
        refresh();
    }

    const rollbackToBackup = async (basename) => {
        setSnackbarMessage(`Rolling back to backup ${basename}`);
        setSnackbarSuccessful(true);
        setSnackbarOpen(true);
        const requestBody = new FormData()
        requestBody.append("hash", basename);

        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `ai_backend/task_generation_model/rollback/`,
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

        if (rawData.message) {
            setSnackbarMessage("Successfully rolled back");
            setSnackbarSuccessful(true);
            setSnackbarOpen(true);
        }
        refresh();
    }

    const getCurrentVersion = async () => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `ai_backend/task_generation_model/current_backup_version`,
            {
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                },
            }
        );
        const rawData = await response.json();
        if (rawData.code && rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }
        if (rawData["message"] && rawData["message"] == "Success") {
            setCurrentVersion(rawData.basename);
        }
    }

    const getCurrentModelId = async () => {
        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `ai_backend/task_generation_model/current_model_id`,
            {
                headers: {
                    "Authorization": `Bearer ${cookies.token}`
                },
            }
        );
        const rawData = await response.json();
        if (rawData.code && rawData.code === "token_not_valid") {
            removeCookies("token");
            return;
        }
        if (rawData["message"] && rawData["message"] == "Success") {
            let model_idx = -1;
            for (let i = 0; i < INFO.TASK_GENERATION.length; i++) {
                let modelInfo = INFO.TASK_GENERATION[i];
                if (modelInfo.ID === rawData["model_id"]) {
                    model_idx = i;
                    break;
                }
            }
            if (model_idx >= 0) {
                setSelectedModelIdx(model_idx);
            }
        }
    }

    const deleteBackup = async (basename) => {
        setSnackbarMessage("Deleting backup");
        setSnackbarSuccessful(true);
        setSnackbarOpen(true);
        const requestBody = new FormData()
        requestBody.append("hash", basename);

        const response = await fetch(
            process.env.REACT_APP_BACKEND_URL + `ai_backend/task_generation_model/backup/`,
            {
                method: "DELETE",
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
        if (rawData.message) {
            setSnackbarMessage("Deletion successful");
            setSnackbarSuccessful(true);
            setSnackbarOpen(true);
        }

        refresh();
    }

    const refresh = () => {
        getBackupHistory(backupHistoryPageNumber);
        getCurrentVersion();
    }

    useEffect(() => {
        getCurrentVersion();
        getCurrentModelId();
    }, []);

    useEffect(() => {
        getBackupHistory(backupHistoryPageNumber);
    }, [backupHistoryPageNumber]);

    return (
        <Box>
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
                                <TextField size="small" type="number" value={seed} onInput={(e) => setSeed(e.target.value)} />
                            </Box>
                            <br />
                            <Box>
                                <Typography variant="body1" sx={{ display: "inline-block", width: "30vw" }}>Max steps:</Typography>
                                <TextField size="small" type="number" value={maxSteps} onInput={(e) => setMaxSteps(e.target.value)} />
                            </Box>
                            <br />
                            <Box>
                                <Typography variant="body1" sx={{ display: "inline-block", width: "30vw" }}>Learning Rate:</Typography>
                                <TextField size="small" type="number" value={learningRate} onInput={(e) => setLearningRate(e.target.value)} />
                            </Box>
                            <br />
                            <Box>
                                <Typography variant="body1" sx={{ display: "inline-block", width: "30vw" }}>Gradient Accumulation Steps:</Typography>
                                <TextField size="small" type="number" value={gradientAccumulationSteps} onInput={(e) => setGradientAccumulationSteps(e.target.value)} />
                            </Box>
                            <br />
                            <Box>
                                <Typography variant="body1" sx={{ display: "inline-block", width: "30vw" }}>Weight Decay:</Typography>
                                <TextField size="small" type="number" value={weightDecay} onInput={(e) => setWeightDecay(e.target.value)} />
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
                    Model Status
                </AccordionSummary>
                <AccordionDetails>
                    <Typography sx={{ display: "inline-block", pr: 1 }}>Current model:</Typography>
                    <Typography sx={{ display: "inline-block" }} color="secondary">{INFO.TASK_GENERATION[selectedModelIdx].NAME} {INFO.TASK_GENERATION[selectedModelIdx].SIZE}</Typography>
                    <Box sx={{ m: 1 }} />
                    <Typography>Backup history</Typography>
                    {
                        backupHistory.length === 0 ? (
                            <Typography variant="body2" color="weak" sx={{ padding: 1, fontStyle: "italic" }}>The model does not have any backups</Typography>
                        ) : (
                            backupHistory.map((history, index) => (
                                <Box key={index} sx={{ padding: 1, gap: 1, display: "flex", flexDirection: "column", maxHeight: 400, overflow: "scroll" }}>
                                    <Paper sx={{ width: "100%", padding: 1, display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "none" }}>
                                        <Box>
                                            <Typography>{history.basename === currentVersion ? `${history.basename} (current)` : history.basename}</Typography>
                                            <Typography variant="body2" color="weak">{history.date_created}</Typography>
                                        </Box>
                                        <Box>
                                            <Tooltip title="Rollback">
                                                <IconButton onClick={() => { rollbackToBackup(history.basename) }}>
                                                    <RestoreIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton onClick={() => { deleteBackup(history.basename) }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Paper>
                                </Box>
                            ))
                        )
                    }
                    <Pagination color="secondary" sx={{ paddingBottom: 1 }} count={backupHistoryPagesTotal} page={backupHistoryPageNumber} onChange={(_, value) => { setBackupHistoryPageNumber(value) }} />
                    <Button variant="outlined" color="secondary" size="small" onClick={backupModel}>Backup current model</Button>
                    <Box sx={{ m: 1 }} />

                    <Typography>Reset to baseline model</Typography>
                    <TaskGenModelSelect onSave={(idx) => setSelectedModelIdx(idx)} open={modelSelectOpen} onClose={() => setModelSelectOpen(false)} />
                    <Button size="small" variant="outlined" onClick={() => setModelSelectOpen(true)}>Select Model</Button>
                    <Box sx={{ m: 1 }} />
                    <Typography variant="body2" color="warning" sx={{ fontStyle: "italic" }}>By clicking the button below, you will reset your model to the pre-trained state.</Typography>
                    <Box sx={{ paddingTop: 1, display: "flex", gap: 1 }}>
                        <Button variant="outlined" color="warning" size="small" onClick={loadBaseline}>Load baseline</Button>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    )
}