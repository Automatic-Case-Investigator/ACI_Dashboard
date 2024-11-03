import { Button, CssBaseline, Divider, Drawer, Stack, Tooltip } from "@mui/material"
import { makeStyles } from '@mui/styles';
import HomeIcon from '@mui/icons-material/Home';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import MemoryIcon from '@mui/icons-material/Memory';
import { useNavigate } from "react-router-dom";

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
        padding: theme.spacing(3),
        marginLeft: drawerWidth,
    },
}));


export const VerticalNavbar = () => {
    const classes = useStyles();
    const navigate = useNavigate();

    return (
        <>
            <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{
                    paper: classes.drawerPaper,
                }}
                anchor="left"
            >
                <Stack direction="column"
                    alignItems="center"
                    justifyContent="center">
                    <Tooltip title="Home" placement="right">
                        <Button sx={{ height: 70 }} fullWidth onClick={() => {navigate("/")}}>
                            <HomeIcon color="primary" fontSize="large" />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Organizations" placement="right">
                        <Button sx={{ height: 50 }} fullWidth onClick={() => {navigate("/organizations")}}>
                            <CorporateFareIcon color="primary" />
                        </Button>
                    </Tooltip>
                    <Tooltip title="AI systems" placement="right">
                        <Button sx={{ height: 50 }} fullWidth onClick={() => {navigate("/ai-systems")}}>
                            <PrecisionManufacturingIcon color="primary" />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Jobs" placement="right">
                        <Button sx={{ height: 50 }} fullWidth onClick={() => {navigate("/jobs")}}>
                            <MemoryIcon color="primary" />
                        </Button>
                    </Tooltip>
                </Stack>
            </Drawer>
        </>
    )
}