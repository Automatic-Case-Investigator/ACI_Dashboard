import { SOARSettings } from "../components/settings/SOARSettings/SOARSettings";
import { SIEMSettings } from "../components/settings/SIEMSettings/SIEMSettings";
import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Helmet } from "react-helmet";
import { Box } from "@mui/material";

export const Settings = () => {
    return (
        <>
            <Helmet>
                <title>Settings</title>
            </Helmet>
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar names={["Settings"]} routes={["/settings"]} />
                <VerticalNavbar />
                <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 5.5, width: 'calc(100vw - 200px)' }}>
                    <SOARSettings />
                    <Box sx={{ m: 2 }} />
                    <SIEMSettings />
                </Box>
            </Box>
        </>
    )
}