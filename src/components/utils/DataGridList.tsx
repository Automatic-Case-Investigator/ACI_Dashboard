import {
    Box,
    Paper,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import PuffLoader from "react-spinners/PuffLoader";
import { useNavigate } from "react-router-dom";

interface DataGridListProps<T> {
    data: T[];
    columns: GridColDef[];
    pageSize: number;
    navigatePath?: (id: string) => string;
}

export const DataGridList = <T extends { id: string; createdAt: Date | string }>({
    data,
    columns,
    pageSize,
    navigatePath,
}: DataGridListProps<T>) => {
    const [formattedData, setFormattedData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        if (data) {
            setFormattedData(
                data.map((item) => ({ ...item, createdAt: new Date(item.createdAt) }))
            );
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
                <Paper
                    sx={{
                        height: "calc(100vh - 200px)",
                        width: "calc(100vw - 160px)",
                    }}
                >
                    <DataGrid
                        rows={formattedData}
                        columns={columns}
                        initialState={{
                            pagination: { paginationModel: { pageSize } },
                        }}
                        pageSizeOptions={[pageSize]}
                        onCellDoubleClick={(params, event) => {
                            if (navigatePath && navigate) {
                                event.defaultMuiPrevented = true;
                                navigate(navigatePath(params.id as string));
                            }
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
            )}
        </>
    );
};