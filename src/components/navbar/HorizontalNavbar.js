import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Breadcrumbs, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';

const drawerWidth = 80;

export const HorizontalNavbar = ({ names, routes }) => {
    const navigate = useNavigate();
    return (
        <AppBar position="fixed" sx={{ display: "flex", justifyContent: "center", width: `calc(100% - ${drawerWidth}px)`, height: 50, marginLeft: drawerWidth }}>
            <Toolbar style={{ paddingRight: 16 }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Breadcrumbs sx={{ color: "secondary.main" }}>
                        {
                            names.map((name, index) => (
                                <Link key={index} underline="hover" onClick={() => { navigate(routes[index], { replace: true }) }}>
                                    {name}
                                </Link>
                            ))
                        }
                    </Breadcrumbs>
                </Box>

                <Tooltip title="Settings">
                    <IconButton edge="start" color="primary" sx={{
                        "& svg": {
                            transition: "transform 0.3s ease-in-out",
                        },
                        "&:hover svg": {
                            transform: "rotate(90deg)",
                        },
                    }} onClick={() => { navigate("/settings", { replace: true }) }}>
                        <SettingsIcon />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
}
