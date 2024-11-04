import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import { Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 80;

export const HorizontalNavbar = ({title}) => {
    const navigate = useNavigate();
    return (
        <AppBar position="fixed" sx={{ display: "flex", justifyContent: "center", width: `calc(100% - ${drawerWidth}px)`, height: 50, marginLeft: drawerWidth }}>
            <Toolbar>
                <Typography variant="body1" component="div" sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>
                <Tooltip title="Settings">
                    <IconButton edge="start" color="primary" sx={{ mr: 2 }} onClick={() => {navigate("/settings")}}>
                        <SettingsIcon />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
}
