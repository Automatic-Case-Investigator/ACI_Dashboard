import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import HorizontalNavbar from '../components/navbar/HorizontalNavbar';
import { VerticalNavbar } from '../components/navbar/VerticalNavbar';
import CoffeeIcon from '@mui/icons-material/Coffee';

export const Home = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <HorizontalNavbar />
            <VerticalNavbar />
            <Box component="main" display="flex" flexDirection="column" alignItems="center" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Typography variant="h3">Automatic Case Investigator</Typography>
                <Button variant="outlined"><CoffeeIcon sx={{ mr: 1 }} />Buy me a coffee</Button>
            </Box>
        </Box>
    )
}