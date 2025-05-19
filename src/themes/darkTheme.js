import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
    type: "dark",
    shape: {
        borderRadius: 4,
    },
    palette: {
        mode: "dark",
        background: {
            default: "#0D0D10"
        },
        primary: {
            main: "#E0E0E0"
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
        MuiPaper: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(8px)',
                    backgroundColor: '#CCCCFF05',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
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
                    backgroundColor: "#CCCCFF05",
                    '&:hover': {
                        boxShadow: `0 0 5px 0 rgba(120,120,255,1)`,
                        borderColor: "rgba(0,255,234,1)",
                    },
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    backgroundColor: "#CCCCFF05",
                    '&:hover': {
                        boxShadow: `0 0 5px 0 rgba(120,120,255,1)`,
                        borderColor: "rgba(0,255,234,1)",
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
                    backgroundColor: "#0000ff10",
                    backdropFilter: "blur(6px)"
                }
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    border: "none",
                    backgroundColor: "#6666ff10",
                    backdropFilter: "blur(6px)"
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
        MuiTab: {
            styleOverrides: {
                root: {
                    transition: 'background-color 0.1s, color 0.1s',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                    },
                },
            },
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
                    backdropFilter: "blur(6px)",
                    '&:hover': {
                        backgroundColor: '#CCCCFF33',
                    },
                },
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    backgroundColor: "#8888ff20",
                },
            },
        },
    }
});