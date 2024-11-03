import { Box, Button, Paper, Typography } from '@mui/material';
import HorizontalNavbar from '../components/navbar/HorizontalNavbar';
import { VerticalNavbar } from '../components/navbar/VerticalNavbar';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import PuffLoader from "react-spinners/PuffLoader"

export const Settings = () => {
    const [soarsData, setSoarsData] = useState([]);
    const [soarsLoading, setSoarsLoading] = useState(true);
    const updateSoarsData = async () => {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + "soar/get_soars_info/");
        const rawData = (await response.json())["message"];
        const output = [];
        for (let soar of rawData) {
            const formattedData = {
                id: soar.id,
                name: soar.name,
                url: `${soar.protocol}//${soar.hostname}${soar.base_dir}`,
                apiKey: soar.api_key
            };
            output.push(formattedData);
        }

        setSoarsData(output);
        setSoarsLoading(false);
    }
    const handleSoarEdit = (params) => {

    }
    const paginationModel = { page: 0, pageSize: 5 };
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', width: 300 },
        { field: 'url', headerName: 'URL', width: 300 },
        { field: 'apiKey', headerName: 'API Key', width: 400 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Button variant="outlined" onClick={() => { handleSoarEdit(params) }}>Edit</Button>
            ),
        },
    ];

    useEffect(() => {
        updateSoarsData();
    }, []);

    return (
        <Box sx={{ display: 'flex' }}>
            <HorizontalNavbar />
            <VerticalNavbar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Typography variant="h4">Settings</Typography>
                <Typography variant="h6">SOAR</Typography>
                {
                    soarsLoading ? (
                        <PuffLoader color="#00ffea" />
                    ) : (
                        <Paper sx={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={soarsData}
                                columns={columns}
                                initialState={{ pagination: { paginationModel } }}
                                pageSizeOptions={[5, 10]}
                                checkboxSelection
                                disableRowSelectionOnClick
                                sx={{
                                    border: 0,
                                    color: "primary.main",
                                    '& .MuiDataGrid-checkboxInput': {
                                        color: 'primary.main',
                                        '&.Mui-checked': {
                                            color: 'secondary.main',
                                        },
                                    },
                                    '& .MuiTablePagination-root': {
                                        color: 'primary.main',
                                    },
                                    '& .MuiTablePagination-selectIcon': {
                                        color: 'primary.main',
                                    },
                                    '& .MuiTablePagination-displayedRows': {
                                        color: 'primary.main',
                                    },
                                    '& .MuiTablePagination-actions > button': {
                                        color: 'primary.main',
                                    },
                                }}
                            />
                        </Paper>

                    )
                }
                <Typography variant="h6">SIEM</Typography>
            </Box>
        </Box>
    )
}