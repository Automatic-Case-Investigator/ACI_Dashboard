import VisibilityIcon from '@mui/icons-material/Visibility';
import { IconButton, Paper, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

export const TaskList = ({ taskList, orgId, caseId }) => {
    const [formattedTaskList, setFormattedTaskList] = useState([]);
    const navigate = useNavigate();
    const columns = [
        { field: "id", type: "string", headerName: "ID", width: 150 },
        { field: "title", type: "string", headerName: "Title", width: 350 },
        { field: "group", type: "string", headerName: "Group", width: 300 },
        { field: "createdAt", type: "dateTime", headerName: "Created At", width: 300 },
        { field: "createdBy", type: "string", headerName: "Created By", width: 200 },
        {
            field: "actions",
            type: "actions",
            width: 150,
            renderCell: (params) => (
                <>
                    <Tooltip title="View">
                        <IconButton onClick={() => {navigate(`/organizations/${orgId}/cases/${caseId}/tasks/${params.row.id}`)}}>
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => {}}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </>
            )
        }
    ];

    useEffect(() => {
        if (taskList && taskList.length > 0) {
            for (let index = 0; index < taskList.length; index++) {
                taskList[index].createdAt = new Date(taskList[index].createdAt)
            }
        }
        setFormattedTaskList(taskList);

    }, [taskList]);
    return (
        <Paper sx={{ height: 400, width: "calc(100vw - 160px)" }}>
            <DataGrid
                rows={formattedTaskList}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 5,
                        },
                    },
                }}
                pageSizeOptions={[5]}
                checkboxSelection
                disableRowSelectionOnClick
                color="primary.main"
                sx={{
                    border: 0,
                    width: "calc(100vw - 160px)",
                    color: "primary.main",
                    "& .MuiDataGrid-checkboxInput": {
                        color: "primary.main",
                        "&.Mui-checked": {
                            color: "secondary.main",
                        },
                    }
                }}
            />
        </Paper>
    );
}