import { Box, Button, TextField, Typography } from "@mui/material";
import { Canvas } from '@react-three/fiber';
import { useRef, useState } from "react";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const Icosphere = () => {
        return (
            <mesh>
                <icosahedronGeometry args={[6, 2]} />
                <meshBasicMaterial color="#8888BB" wireframe={true} />
            </mesh>
        );
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
                    <Typography>Email:</Typography>
                    <TextField value={email} onInput={(e) => {setEmail(e.target.value)}} fullWidth />
                    <br />
                    <br />
                    <Typography>Password:</Typography>
                    <TextField value={password} onInput={(e) => {setPassword(e.target.value)}} fullWidth />
                    <br />
                    <br />
                    <Button color="secondary">Sign in</Button>
                </Box>
            </Box>
        </>
    )
}