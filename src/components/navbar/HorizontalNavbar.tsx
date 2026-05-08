import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Breadcrumbs, Tooltip, Link, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNavDrawer } from "../../contexts/NavDrawerContext";
import { HorizontalNavbarProps } from "../../types/types";

const drawerWidth = 80;

export const HorizontalNavbar: React.FC<HorizontalNavbarProps> = ({
    names,
    routes,
}) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { toggleMobileDrawer } = useNavDrawer();

    return (
        <AppBar
            position="fixed"
            sx={{
                display: "flex",
                justifyContent: "center",
                width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
                height: 50,
                marginLeft: { xs: 0, sm: `${drawerWidth}px` },
            }}
        >
            <Toolbar sx={{ paddingRight: 2, minHeight: 50 }}>
                {isMobile && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={toggleMobileDrawer}
                        sx={{ mr: 1 }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
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
