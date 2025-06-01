import React from "react";
import { Login } from "../pages/Login";
import { useCookies } from "react-cookie";

interface AuthMiddlewareProps {
    child: React.ReactElement;
}

export const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ child }) => {
    const [cookie, _setCookie] = useCookies(["token"]);

    return <>
        {
            cookie.token ? child : <Login />
        }
    </>;
}