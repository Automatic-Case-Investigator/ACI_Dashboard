import { HorizontalNavbar } from "../components/navbar/HorizontalNavbar";
import { VerticalNavbar } from "../components/navbar/VerticalNavbar";
import CoffeeIcon from "@mui/icons-material/Coffee";
import { Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { Helmet } from "react-helmet";


export const Home = () => {
    return (
        <>
            <Helmet>
                <title>Home</title>
            </Helmet>
            <Box sx={{ display: "flex" }}>
                <HorizontalNavbar title="Home" />
                <VerticalNavbar />
                <Box component="main" display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ minHeight: "calc(100vh - 50px)", flexGrow: 1, p: 2, mt: 5.5 }}>
                    <img src="/assets/icons/ACI_large.svg" width={250}></img>
                    <br />
                    <br />
                    <Typography variant="h3">Automatic Case Investigator</Typography>
                    <Button color="secondary" variant="outlined"><CoffeeIcon sx={{ mr: 1 }} />Buy me a coffee</Button>
                </Box>
            </Box>
        </>
    )
}