import { User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    isSignedIn: boolean;
    token: string | null;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    isSignedIn: false,
});

export function useAuth() {
    const context = useContext(AuthContext);

    return context;
}
