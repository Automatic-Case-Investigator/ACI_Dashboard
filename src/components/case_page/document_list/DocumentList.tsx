import DeleteIcon from "@mui/icons-material/Delete";
import {
    Dialog,
    IconButton,
    Tooltip,
} from "@mui/material";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { ConfirmationDialog } from "../../utils/ConfirmationDialog";
import { ActionObject, CallbackFunction, DocumentData } from "../../../types/types";
import { useCookies } from "react-cookie";
import { DataGridList } from "../../utils/DataGridList";
import { useState } from "react";

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
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [upcomingAction, setUpcomingAction] = useState<ActionObject>({});
    const [cookies, , removeCookies] = useCookies(["token"]);

    const scheduleUpcomingAction = (
        func: (...args: any[]) => Promise<void>,
        ...args: any[]
    ) => setUpcomingAction({ func, args });

    const executeUpcomingAction = async () => {
        if (upcomingAction.func) await upcomingAction.func(...(upcomingAction.args || []));
        onRefresh();
    };

    const handleDocumentDelete = async (params: GridRowParams) => {
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

    return (
        <>
            <Dialog open={confirmDialogOpen}>
                <ConfirmationDialog
                    onCancel={() => setConfirmDialogOpen(false)}
                    onContinue={() => {
                        executeUpcomingAction();
                        setConfirmDialogOpen(false);
                    }}
                />
            </Dialog>

            <DataGridList
                data={documentList}
                columns={columns}
                pageSize={10}
                navigatePath={(id) => `/organizations/${orgId}/cases/${caseId}/documents/${id}`}
            />
        </>
    );
};