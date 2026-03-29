import { Box, Paper, Button, Fade, Typography, Dialog } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
// Added GridRowSelectionModel to imports
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import PuffLoader from "react-spinners/PuffLoader";
import { useNavigate } from "react-router-dom";
import { ConfirmationDialog } from "./ConfirmationDialog";

interface DataGridListProps<T> {
    data: T[];
    columns: GridColDef[];
    pageSize: number;
    navigatePath?: (id: string) => string;
    onMassDelete: (ids: string[]) => void | Promise<void>;
    enableSelection: boolean;
}

export const DataGridList = <T extends { id: string | number; createdAt: Date | string }>({
    data,
    columns,
    pageSize,
    navigatePath,
    onMassDelete,
    enableSelection = false,
}: DataGridListProps<T>) => {
    const [formattedData, setFormattedData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (data) {
            setLoading(true);
            const formatted = data.map((item) => ({
                ...item,
                createdAt: new Date(item.createdAt)
            }));
            setFormattedData(formatted);
            setLoading(false);
        }
    }, [data]);

    return (
        <>
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <PuffLoader color="#00ffea" />
                </Box>
            ) : (
                <Paper sx={{ height: "calc(100vh - 200px)", width: "calc(100vw - 160px)" }}>
                    <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} fullWidth>
                        <ConfirmationDialog
                            onCancel={() => setConfirmDialogOpen(false)}
                            onContinue={async () => {
                                await onMassDelete(selectionModel.map(id => id.toString()));
                                setSelectionModel([]);
                                setConfirmDialogOpen(false);
                            }}
                        />
                    </Dialog>
                    <DataGrid
                        rows={formattedData}
                        columns={columns}
                        initialState={{
                            pagination: { paginationModel: { pageSize } },
                        }}
                        pageSizeOptions={[pageSize]}
                        onCellDoubleClick={(params, event) => {
                            if (navigatePath) {
                                event.defaultMuiPrevented = true;
                                navigate(navigatePath(params.id as string));
                            }
                        }}
                        checkboxSelection={enableSelection}
                        rowSelectionModel={selectionModel}
                        onRowSelectionModelChange={(newSelectionModel) => {
                            setSelectionModel(newSelectionModel);
                        }}
                        sx={{
                            border: 0,
                            "& .MuiDataGrid-checkboxInput": {
                                color: "primary.main",
                                "&.Mui-checked": { color: "secondary.main" },
                            },
                        }}
                    />
                    <Fade in={enableSelection && selectionModel.length > 0} timeout={300} unmountOnExit>
                        <Paper elevation={6} sx={{
                            position: 'fixed',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1300,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            borderRadius: 2,
                            px: 2,
                            py: 1,                            bgcolor: 'grey.900',
                            border: '1px solid',
                            borderColor: 'divider',                        }}>
                            <Typography variant="body2" color="text.secondary">
                                {selectionModel.length} selected
                            </Typography>
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={() => setConfirmDialogOpen(true)}
                                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                            >
                                Delete Selected
                            </Button>
                        </Paper>
                    </Fade>
                </Paper>
            )}
        </>
    );
};
