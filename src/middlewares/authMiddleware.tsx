import React from "react";
import { Login } from "../pages/Login";
import { useCookies } from "react-cookie";
import { AuthMiddlewareProps } from "../types/types";

export const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ child }) => {
    const [cookie, _setCookie] = useCookies(["token"]);

    return <>
        {
            cookie.token ? child : <Login />
        }
    </>;
}