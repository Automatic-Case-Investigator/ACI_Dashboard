import { Box, Typography } from '@mui/material';
import HorizontalNavbar from '../components/navbar/HorizontalNavbar';
import { VerticalNavbar } from '../components/navbar/VerticalNavbar';

export const AISystems = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <HorizontalNavbar />
            <VerticalNavbar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Typography variant="h4">AI Systems</Typography>
                <Typography variant="body1">Development in progress</Typography>
            </Box>
        </Box>
    )
}