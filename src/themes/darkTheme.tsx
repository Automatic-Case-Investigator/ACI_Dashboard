import { createTheme } from "@mui/material/styles";
import { ThemeOptions } from "@mui/material/styles/createTheme";
import { APP_COLORS } from "./colors";

// Extend the palette to include "weak"
declare module "@mui/material/styles" {
    interface Palette {
        weak: {
            main: string;
        };
    }

    interface PaletteOptions {
        weak?: {
            main: string;
        };
    }
}

export const darkTheme = createTheme({
    shape: {
        borderRadius: 4,
    },
    palette: {
        mode: "dark",
        background: {
            default: APP_COLORS.backgroundDefault
        },
        primary: {
            main: APP_COLORS.primaryText
        },
        secondary: {
            main: APP_COLORS.secondaryAccent
        },
        weak: {
            main: APP_COLORS.weakText
        }
    },
    typography: {
        body1: {
            color: APP_COLORS.white
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: `${APP_COLORS.surfaceHover} ${APP_COLORS.surfaceMuted}`,
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: APP_COLORS.surfaceMuted,
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        backgroundColor: APP_COLORS.surfaceHover,
                    },
                    "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                        backgroundColor: APP_COLORS.surfaceMuted,
                    },
                    fontWeightLight: 300,
                    fontWeightRegular: 400,
                    fontWeightMedium: 500
                },
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(8px)',
                    backgroundColor: APP_COLORS.backgroundPaper,
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
                    backgroundColor: APP_COLORS.surfaceSoft,
                    '&:hover': {
                        boxShadow: `0 0 5px 0 ${APP_COLORS.glowBlue}`,
                        borderColor: APP_COLORS.glowCyan,
                    },
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    backgroundColor: APP_COLORS.surfaceSoft,
                    '&:hover': {
                        boxShadow: `0 0 5px 0 ${APP_COLORS.glowBlue}`,
                        borderColor: APP_COLORS.glowCyan,
                    },
                }
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: APP_COLORS.white,
                    transition: "50ms ease-out 50ms",
                    '&:hover': {
                        backgroundColor: APP_COLORS.surfaceHover
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                colorPrimary: {
                    backgroundColor: APP_COLORS.surfaceAppBar,
                    backdropFilter: "blur(6px)"
                }
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    border: "none",
                    backgroundColor: APP_COLORS.surfaceDrawer,
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
                        backgroundColor: APP_COLORS.tabHoverBg,
                        color: APP_COLORS.textHover,
                    },
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: APP_COLORS.borderTooltip,
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
                    backgroundColor: APP_COLORS.surfaceMuted,
                    transition: "50ms ease-out 50ms",
                    backdropFilter: "blur(6px)",
                    '&:hover': {
                        backgroundColor: APP_COLORS.surfaceHover,
                    },
                },
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    backgroundColor: APP_COLORS.surfaceAccordion,
                },
            },
        },
    }
} as ThemeOptions);
