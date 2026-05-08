import {
    Button,
    Drawer,
    Menu,
    MenuItem,
    Stack,
    Tooltip,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// import MenuBookIcon from '@mui/icons-material/MenuBook';
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import MemoryIcon from "@mui/icons-material/Memory";
import { MouseEvent, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavDrawer } from "../../contexts/NavDrawerContext";

const drawerWidth = 80;

export const VerticalNavbar: React.FC = () => {
    const [_cookies, _setCookies, removeCookies] = useCookies(["token"]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { mobileOpen, closeMobileDrawer } = useNavDrawer();

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        removeCookies("token");
        navigate("/login", { replace: true });
    };

    const handleNavClick = (path: string) => {
        navigate(path, { replace: true });
        if (isMobile) closeMobileDrawer();
    };

    const drawerContent = (
        <Stack direction="column" alignItems="center" justifyContent="center">
            <Tooltip title="Home" placement="right">
                <Button sx={{ height: 50 }} fullWidth onClick={() => handleNavClick("/")}>
                    <img src="/assets/icons/ACI_small.svg" width={30} alt="ACI" />
                </Button>
            </Tooltip>
            <Tooltip title="Organizations" placement="right">
                <Button sx={{ height: 50 }} fullWidth onClick={() => handleNavClick("/organizations")}>
                    <CorporateFareIcon />
                </Button>
            </Tooltip>
            {/* <Tooltip title="Knowledge" placement="right">
                <Button sx={{ height: 50 }} fullWidth onClick={() => handleNavClick("/knowledge")}>
                    <MenuBookIcon />
                </Button>
            </Tooltip> */}
            <Tooltip title="Jobs" placement="right">
                <Button sx={{ height: 50 }} fullWidth onClick={() => handleNavClick("/jobs")}>
                    <MemoryIcon />
                </Button>
            </Tooltip>
            <Button
                sx={{ position: "absolute", bottom: 0, height: 50 }}
                fullWidth
                onClick={(e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)}
            >
                <AccountCircleIcon />
            </Button>
        </Stack>
    );

    const drawerSx = {
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
    };

    return (
        <>
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? mobileOpen : undefined}
                onClose={isMobile ? closeMobileDrawer : undefined}
                ModalProps={isMobile ? { keepMounted: true } : undefined}
                sx={drawerSx}
                anchor="left"
            >
                {drawerContent}
            </Drawer>

            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
            >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </>
    );
};
