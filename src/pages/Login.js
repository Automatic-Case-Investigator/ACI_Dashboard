import { Box, Button, TextField, Typography } from "@mui/material";
import { Canvas } from '@react-three/fiber';
import { useState } from "react";
import { useCookies } from "react-cookie"

export const Login = () => {
    const [cookies, setCookies, removeCookies] = useCookies(["token"]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const Icosphere = () => {
        return (
            <mesh>
                <icosahedronGeometry args={[6, 2]} />
                <meshBasicMaterial color="#8888BB" wireframe={true} />
            </mesh>
        );
    };
    const getUserToken = async () => {
        setLoading(true);
        setMessage("");
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
        const responseJson = await response.json();
        if (!responseJson.access) {
            setMessage("Invalid Username or Password");
            setLoading(false);
            return;
        }

        setCookies("token", responseJson.access);
        setLoading(false);
    };

    return (
        <>
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
                    <Typography>Username:</Typography>
                    <TextField value={username} onInput={(e) => {setUsername(e.target.value)}} fullWidth />
                    <br />
                    <br />
                    <Typography>Password:</Typography>
                    <TextField type="password" value={password} onInput={(e) => {setPassword(e.target.value)}} fullWidth />
                    <br />
                    <br />
                    <Button color="secondary" onClick={getUserToken} loading={loading}>
                        Sign in
                    </Button>
                    <br />
                    <Typography color="error">{message}</Typography>
                </Box>
            </Box>
        </>
    )
}