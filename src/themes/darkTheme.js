import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
    type: "dark",
    palette: {
        mode: "dark",
        background: {
            default: "#12192d",
            paper: '#8888FF08'
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
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: "#ffffff33 #ffffff11",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "#ffffff11",
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: "#ffffff33",
                        minHeight: 24,
                        border: "3px solid #ffffff11",
                    },
                    "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                        backgroundColor: "#ffffff11",
                    },
                },
            }
        },
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
                    border: "none",
                    backgroundColor: '#172549',
                    color: '#FFFFFF'
                },
            }
        },
        MuiList: {
            styleOverrides: {
                root: {
                    display: "flex",
                    flexDirection: "column",
                    gap: 4
                }
            }
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    backgroundColor: '#CCCCFF11',
                    transition: "50ms ease-out 50ms",
                    '&:hover': {
                        backgroundColor: '#CCCCFF33',
                    },
                },
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    backgroundColor: "#8888FF08"
                },
            },
        },
    }
});