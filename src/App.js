import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { Organizations } from "./pages/Organizations";
import { AISystems } from "./pages/AISystems";
import { Jobs } from "./pages/Jobs";


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
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#FFFFFF22'
          },
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
          <Route path="/ai-systems" element={<AISystems />}></Route>
          <Route path="/jobs" element={<Jobs />}></Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
