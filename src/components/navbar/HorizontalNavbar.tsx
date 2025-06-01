import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Breadcrumbs, Tooltip, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

const drawerWidth = 80;

interface HorizontalNavbarProps {
    names: string[];
    routes: string[];
}

export const HorizontalNavbar: React.FC<HorizontalNavbarProps> = ({
    names,
    routes,
}) => {
    const navigate = useNavigate();

    return (
        <AppBar
            position="fixed"
            sx={{
                display: "flex",
                justifyContent: "center",
                width: `calc(100% - ${drawerWidth}px)`,
                height: 50,
                marginLeft: drawerWidth,
            }}
        >
            <Toolbar sx={{ paddingRight: 2, minHeight: 50 }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Breadcrumbs sx={{ color: "primary.main" }}>
                        {names.map((name, index) => (
                            <Link
                                key={index}
                                underline="hover"
                                sx={{ cursor: "pointer", color: "inherit" }}
                                onClick={() => navigate(routes[index], { replace: true })}
                            >
                                {name}
                            </Link>
                        ))}
                    </Breadcrumbs>
                </Box>

                <Tooltip title="Settings">
                    <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => navigate("/settings", { replace: true })}
                        sx={{
                            "& svg": {
                                transition: "transform 0.3s ease-in-out",
                            },
                            "&:hover svg": {
                                transform: "rotate(90deg)",
                            },
                        }}
                    >
                        <SettingsIcon />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
};
