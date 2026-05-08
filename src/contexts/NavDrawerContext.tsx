import { createContext, useContext, useState } from "react";
import { NavDrawerContextType, NavDrawerProviderProps } from "../types/types";

const NavDrawerContext = createContext<NavDrawerContextType>({
    mobileOpen: false,
    toggleMobileDrawer: () => {},
    closeMobileDrawer: () => {},
});

export const useNavDrawer = () => useContext(NavDrawerContext);

export const NavDrawerProvider = ({ children }: NavDrawerProviderProps) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    return (
        <NavDrawerContext.Provider
            value={{
                mobileOpen,
                toggleMobileDrawer: () => setMobileOpen((prev) => !prev),
                closeMobileDrawer: () => setMobileOpen(false),
            }}
        >
            {children}
        </NavDrawerContext.Provider>
    );
};
