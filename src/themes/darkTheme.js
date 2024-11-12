import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
    type: "dark",
    palette: {
        mode: "dark",
        background: {
            default: "#212940",
            paper: '#21335F'
        },
        primary: {
            main: "#FFFFFF"
        },
        secondary: {
            main: "#00FFEA"
        },
        weak: {
            main: "#FFFFFFAA"
        }
    },
    typography: {
        body1: {
            color: '#FFFFFF'
        },
    },
    components: {
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: '#FFFFFF',
                    '&:hover': {
                        backgroundColor: '#FFFFFF22'
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                colorPrimary: {
                    backgroundColor: "#21335F",
                    borderBottom: "1px solid #FFFFFF66"
                }
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#21335F',
                    color: '#FFFFFF',
                    borderRight: "1px solid #FFFFFF66"
                },
            }
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: '#FFFFFF22'
                    },
                },
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    backgroundColor: "#384a75"
                },
            },
        },
    }
});