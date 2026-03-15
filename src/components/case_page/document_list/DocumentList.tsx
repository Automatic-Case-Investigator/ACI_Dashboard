import DeleteIcon from "@mui/icons-material/Delete";
import {
    Box,
    Dialog,
    IconButton,
    Paper,
    Tooltip,
    Snackbar,
    Button,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowParams, GridRowSelectionModel } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { ConfirmationDialog } from "../../utils/ConfirmationDialog";
import PuffLoader from "react-spinners/PuffLoader";
import { ActionObject, CallbackFunction, DocumentData } from "../../../types/types";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

interface DocumentListProps {
    documentList: DocumentData[];
    soarId: string;
    orgId: string;
    caseId: string;
    onRefresh: CallbackFunction;
}

export const DocumentList: React.FC<DocumentListProps> = ({
    documentList,
    soarId,
    orgId,
    caseId,
    onRefresh,
}) => {
    const [formattedDocumentList, setFormattedDocumentList] = useState<DocumentData[]>([]);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
    const [upcomingAction, setUpcomingAction] = useState<ActionObject>({});
    const [loading, setLoading] = useState(true);
    const [cookies, , removeCookies] = useCookies(["token"]);

    const navigate = useNavigate();

    const scheduleUpcomingAction = (
        func: (...args: any[]) => Promise<void>,
        ...args: any[]
    ) => setUpcomingAction({ func, args });

    const executeUpcomingAction = async () => {
        if (upcomingAction.func) await upcomingAction.func(...(upcomingAction.args || []));
        onRefresh();
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", flex: 0.2 },
        { field: "title", headerName: "Title", flex: 0.6 },
        { field: "category", headerName: "Category", flex: 0.4 },
        { field: "createdAt", headerName: "Created At", flex: 0.4, type: "dateTime" },
        { field: "createdBy", headerName: "Created By", flex: 0.3 },
        {
            field: "actions",
            headerName: "Actions",
            flex: 0.3,
            renderCell: (params) => (
                <>
                    <Tooltip title="Delete">
                        <IconButton
                            onClick={() => {
                                scheduleUpcomingAction(handleDocumentDelete, params);
                                setConfirmDialogOpen(true);
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </>
            ),
        },
    ];

    const handleDocumentDelete = async (params: GridRowParams) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("soar_id", soarId);
            formData.append("document_id", params.row.id);

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}soar/document/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${cookies.token}` },
                body: formData,
            });

            const json = await response.json();
            if (json.code === "token_not_valid") return removeCookies("token");
            if (!response.ok) throw new Error("Failed to delete document");

            setFormattedDocumentList((prev) => prev.filter((d) => d.id !== params.row.id));
        } catch (e) {
            console.error("Error deleting document:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentMassDelete = async () => {
        setLoading(true);
        try {
            await Promise.all(
                selectionModel.map(async (documentId) => {
                    const formData = new FormData();
                    formData.append("soar_id", soarId);
                    formData.append("document_id", documentId as string);
                    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}soar/document/`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${cookies.token}` },
                        body: formData,
                    });
                    const json = await response.json();
                    if (json.code === "token_not_valid") removeCookies("token");
                })
            );
            setFormattedDocumentList((prev) =>
                prev.filter((d) => !selectionModel.includes(d.id))
            );
            setSelectionModel([]);
        } catch (e) {
            console.error("Error deleting documents:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        if (documentList) {
            setFormattedDocumentList(
                documentList.map((d) => ({ ...d, createdAt: new Date(d.createdAt) }))
            );
            setLoading(false);
        }
    }, [documentList]);

    return (
        <>
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <PuffLoader color="#00ffea" />
                </Box>
            ) : (
                <>
                    <Snackbar
                        open={selectionModel.length > 0}
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                        message={`${selectionModel.length} document(s) selected`}
                        action={
                            <Button
                                color="error"
                                variant="contained"
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={() => {
                                    scheduleUpcomingAction(handleDocumentMassDelete);
                                    setConfirmDialogOpen(true);
                                }}
                            >
                                Delete
                            </Button>
                        }
                    />

                    <Dialog open={confirmDialogOpen}>
                        <ConfirmationDialog
                            onCancel={() => setConfirmDialogOpen(false)}
                            onContinue={() => {
                                executeUpcomingAction();
                                setConfirmDialogOpen(false);
                            }}
                        />
                    </Dialog>

                    <Paper
                        sx={{
                            height: "calc(100vh - 200px)",
                            width: "calc(100vw - 160px)",
                        }}
                    >
                        <DataGrid
                            rows={formattedDocumentList}
                            columns={columns}
                            checkboxSelection
                            rowSelectionModel={selectionModel}
                            onRowSelectionModelChange={setSelectionModel}
                            disableRowSelectionOnClick
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            pageSizeOptions={[10]}
                            onCellDoubleClick={(params, event) => {
                                event.defaultMuiPrevented = true;
                                navigate(
                                    `/organizations/${orgId}/cases/${caseId}/documents/${params.id}`
                                );
                            }}
                            sx={{
                                border: 0,
                                width: "calc(100vw - 160px)",
                                "& .MuiDataGrid-checkboxInput": {
                                    color: "primary.main",
                                    "&.Mui-checked": { color: "secondary.main" },
                                },
                            }}
                        />
                    </Paper>
                </>
            )}
        </>
    );
};
