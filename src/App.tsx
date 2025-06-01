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
import { AISystems } from "./pages/AISystems";
import { Jobs } from "./pages/Jobs";
import { Cases } from "./pages/Cases";
import { CasePage } from "./pages/CasePage";
import { darkTheme } from "./themes/darkTheme";
import { TaskPage } from "./pages/TaskPage";
import { CookiesProvider } from "react-cookie";
import { AuthMiddleware } from "./middlewares/authMiddleware";



function App() {
    return (
        <CookiesProvider>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <Router>
                    <Routes>
                        <Route path="/" element={<AuthMiddleware child={<Home />} />}></Route>
                        <Route path="/settings" element={<AuthMiddleware child={<Settings />} />}></Route>
                        <Route path="/organizations" element={<AuthMiddleware child={<Organizations />} />}></Route>
                        <Route path="/organizations/:orgId/cases" element={<AuthMiddleware child={<Cases />} />} />
                        <Route path="/organizations/:orgId/cases/:caseId" element={<AuthMiddleware child={<CasePage />} />} />
                        <Route path="/organizations/:orgId/cases/:caseId/tasks/:taskId" element={<AuthMiddleware child={<TaskPage />} />} />
                        <Route path="/ai-systems" element={<AuthMiddleware child={<AISystems />} />}></Route>
                        <Route path="/jobs" element={<AuthMiddleware child={<Jobs />} />}></Route>
                        <Route path="*" element={<Navigate to="/" />}></Route>
                    </Routes>
                </Router>
            </ThemeProvider>
        </CookiesProvider>
    );
}

export default App;
