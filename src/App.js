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
