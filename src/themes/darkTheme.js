import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
    type: "dark",
    shape: {
        borderRadius: 0,
    },
    palette: {
        mode: "dark",
        background: {
            default: "#12192d",
            paper: '#161c33'
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
                    scrollbarColor: "#CCCCFF33 #CCCCFF11",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: "#CCCCFF11",
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        backgroundColor: "#CCCCFF33",
                    },
                    "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                        backgroundColor: "#CCCCFF11",
                    },
                },
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    transition: "50ms ease-out 50ms",
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& input[type="number"]::-webkit-inner-spin-button, & input[type="number"]::-webkit-outer-spin-button': {
                        WebkitAppearance: 'none',
                        margin: 0,
                    },
                }
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: '#FFFFFF',
                    transition: "50ms ease-out 50ms",
                    '&:hover': {
                        backgroundColor: '#CCCCFF33'
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
                    backgroundColor: '#161c33',
                    color: '#FFFFFF'
                },
            }
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    transition: "all 200ms ease",
                },
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#444466',
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
                    backgroundColor: "#8888FF08",
                    border: 0
                },
            },
        },
    }
});