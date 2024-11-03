import { Box, Typography } from '@mui/material';
import HorizontalNavbar from '../components/navbar/HorizontalNavbar';
import { VerticalNavbar } from '../components/navbar/VerticalNavbar';

export const Organizations = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <HorizontalNavbar />
            <VerticalNavbar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Typography variant="h4">Organizations</Typography>
                <Typography variant="body1">You haven't select your SOAR platform yet. Please select your SOAR platform in settings.</Typography>
            </Box>
        </Box>
    )
}