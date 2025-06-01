import { Box, Button, TextField, Typography } from "@mui/material";
import { Canvas } from '@react-three/fiber';
import { useState, ChangeEvent } from "react";
import { useCookies } from "react-cookie";
import { Helmet } from "react-helmet";

interface TokenResponse {
    access?: string;
    detail?: string;
}

export const Login = () => {
    const [_cookies, setCookies, _removeCookies] = useCookies(["token"]);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const Icosphere = () => {
        return (
            <mesh>
                <icosahedronGeometry args={[6, 2]} />
                <meshBasicMaterial color="#8888BB" wireframe={true} />
            </mesh>
        );
    };

    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const getUserToken = async () => {
        setLoading(true);
        setMessage("");
        
        try {
            const response = await fetch(
                process.env.REACT_APP_BACKEND_URL + `token/`,
                {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseJson: TokenResponse = await response.json();
            
            if (!responseJson.access) {
                setMessage(responseJson.detail || "Invalid Username or Password");
                setLoading(false);
                return;
            }

            setCookies("token", responseJson.access, { path: "/" });
            setLoading(false);
        } catch (error) {
            setMessage("Login failed. Please try again.");
            setLoading(false);
            console.error("Login error:", error);
        }
    };

    return (
        <>
            <Helmet>
                <title>Login</title>
            </Helmet>
            <div style={{ width: "100vw", height: "100vh" }}>
                <Canvas>
                    <Icosphere />
                </Canvas>
            </div>

            <Box sx={{
                position: "absolute",
                top: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100vw",
                height: "100vh"
            }}>
                <Box sx={{
                    margin: "auto",
                    width: "50%",
                    padding: 2,
                    backgroundColor: '#CCCCFF11',
                    backdropFilter: "blur(6px)",
                }}>
                    <Typography variant="h4" align="center">Login</Typography>
                    <br />
                    <TextField 
                        label="Username" 
                        value={username} 
                        onChange={handleUsernameChange} 
                        fullWidth 
                    />
                    <br />
                    <br />
                    <TextField 
                        label="Password" 
                        type="password" 
                        value={password} 
                        onChange={handlePasswordChange} 
                        fullWidth 
                    />
                    <br />
                    <br />
                    <Button 
                        variant="contained" 
                        onClick={getUserToken} 
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>
                    <br />
                    <Typography color="error">{message}</Typography>
                </Box>
            </Box>
        </>
    )
}