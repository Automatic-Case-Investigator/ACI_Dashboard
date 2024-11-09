import {
    BrowserRouter as Router,
    Navigate,
    Routes,
    Route,
} from "react-router-dom";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { Organizations } from "./pages/Organizations";
import { AISystems } from "./pages/AISystems";
import { Jobs } from "./pages/Jobs";
import { Cases } from "./pages/Cases";
import { CasePage } from "./pages/CasePage";


const darkTheme = createTheme({
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
                    borderBottom: "1px solid #FFFFFF88"
                }
            }
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#21335F',
                    color: '#FFFFFF',
                    borderRight: "1px solid #FFFFFF88"
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


function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/" element={<Home />}></Route>
                    <Route path="/settings" element={<Settings />}></Route>
                    <Route path="/organizations" element={<Organizations />}></Route>
                    <Route path="/organizations/:orgId/cases" element={<Cases />} />
                    <Route path="/organizations/:orgId/cases/:caseId" element={<CasePage />} />
                    <Route path="/ai-systems" element={<AISystems />}></Route>
                    <Route path="/jobs" element={<Jobs />}></Route>
                    <Route path="*" element={<Navigate to="/" />}></Route>
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
