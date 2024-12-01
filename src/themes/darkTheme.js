import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
    type: "dark",
    palette: {
        mode: "dark",
        background: {
            default: "#12192d",
            paper: '#172549'
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
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                },
            },
        },
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
                    backgroundColor: "#172549"
                }
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#172549',
                    color: '#FFFFFF'
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