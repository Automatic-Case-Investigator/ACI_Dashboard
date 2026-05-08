import {
    BrowserRouter as Router,
    Navigate,
    Routes,
    Route,
} from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { Organizations } from "./pages/Organizations";
import { Jobs } from "./pages/Jobs";
import { Cases } from "./pages/Cases";
import { CasePage } from "./pages/CasePage";
import { darkTheme } from "./themes/darkTheme";
import { TaskPage } from "./pages/TaskPage";
import { CookiesProvider } from "react-cookie";
import { AuthMiddleware } from "./middlewares/authMiddleware";
import { DocumentPage } from "./pages/DocumentPage";
import { NavDrawerProvider } from "./contexts/NavDrawerContext";



function App() {
    return (
        <CookiesProvider>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <NavDrawerProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<AuthMiddleware child={<Home />} />}></Route>
                        <Route path="/settings" element={<AuthMiddleware child={<Settings />} />}></Route>
                        <Route path="/organizations" element={<AuthMiddleware child={<Organizations />} />}></Route>
                        <Route path="/organizations/:orgId/cases" element={<AuthMiddleware child={<Cases />} />} />
                        <Route path="/organizations/:orgId/cases/:caseId" element={<AuthMiddleware child={<CasePage />} />} />
                        <Route path="/organizations/:orgId/cases/:caseId/tasks/:taskId" element={<AuthMiddleware child={<TaskPage />} />} />
                        <Route path="/organizations/:orgId/cases/:caseId/documents/:documentId" element={<AuthMiddleware child={<DocumentPage />} />} />
                        <Route path="/jobs" element={<AuthMiddleware child={<Jobs />} />}></Route>
                        <Route path="*" element={<Navigate to="/" />}></Route>
                    </Routes>
                </Router>
                </NavDrawerProvider>
            </ThemeProvider>
        </CookiesProvider>
    );
}

export default App;
