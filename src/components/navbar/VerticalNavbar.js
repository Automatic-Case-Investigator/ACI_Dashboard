import { Button, Drawer, Menu, MenuItem, Stack, Tooltip } from "@mui/material"
import { makeStyles } from '@mui/styles';
import { useNavigate } from "react-router-dom";
import TokenIcon from '@mui/icons-material/Token';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import MemoryIcon from '@mui/icons-material/Memory';
import { useState } from "react";
import { useCookies } from "react-cookie";

const drawerWidth = 80;

const useStyles = makeStyles((theme) => ({
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    content: {
        flexGrow: 1,
        padding: 2,
        marginLeft: drawerWidth,
    },
}));


export const VerticalNavbar = () => {
    const [cookies, setCookies, removeCookies] = useCookies(["token"]);
    const [anchorEl, setAnchorEL] = useState(null);
    const open = Boolean(anchorEl);
    const classes = useStyles();
    const navigate = useNavigate();

    const handleClose = () => {
        setAnchorEL(null);
    }

    const handleLogout = () => {
        handleClose();
        removeCookies("token");
    }

    return (
        <>
            <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{ paper: classes.drawerPaper }}
                anchor="left"
            >
                <Stack direction="column"
                    alignItems="center"
                    justifyContent="center">
                    <Tooltip title="Home" placement="right">
                        <Button sx={{ height: 50 }} fullWidth onClick={() => { navigate("/", { replace: true }) }}>
                            <img src="/assets/icons/ACI_small.svg" width={30}></img>
                        </Button>
                    </Tooltip>
                    <Tooltip title="Organizations" placement="right">
                        <Button sx={{ height: 50 }} fullWidth onClick={() => { navigate("/organizations", { replace: true }) }}>
                            <CorporateFareIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip title="AI systems" placement="right">
                        <Button sx={{ height: 50 }} fullWidth onClick={() => { navigate("/ai-systems", { replace: true }) }}>
                            <TokenIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Jobs" placement="right">
                        <Button sx={{ height: 50 }} fullWidth onClick={() => { navigate("/jobs", { replace: true }) }}>
                            <MemoryIcon />
                        </Button>
                    </Tooltip>
                    <Button sx={{ position: "absolute", bottom: 0, height: 50 }} fullWidth onClick={(e) => { setAnchorEL(e.currentTarget) }}>
                        <AccountCircleIcon />
                    </Button>
                </Stack>
            </Drawer>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </>
    )
}