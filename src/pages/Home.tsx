import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import { Box, Typography } from "@mui/material";
import { Helmet } from "react-helmet";


export const Home = () => {
    return (
        <>
            <Helmet>
                <title>Home</title>
            </Helmet>
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar names={["Home"]} routes={["/"]} />
                <VerticalNavbar />
                <Box component="main" display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ minHeight: "calc(100vh - 50px)", flexGrow: 1, p: 2, mt: 5.5 }}>
                    <img src="/assets/icons/ACI_large.svg" width={250}></img>
                    <br />
                    <br />
                    <Typography variant="h3">Automatic Case Investigator</Typography>
                    <Typography variant="body2">Made by acezxn with ♥️</Typography>
                </Box>
            </Box>
        </>
    )
}