import { Login } from "../pages/Login";
import { useCookies } from "react-cookie";

export const AuthMiddleware = ({ child }) => {
    const [cookie, setCookie] = useCookies(["token"]);

    return <>
        {
            cookie.token ? child : <Login />
        }
    </>;
}