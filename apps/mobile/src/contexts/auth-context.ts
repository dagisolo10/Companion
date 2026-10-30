import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    isSignedIn: boolean;
    token: string | null;
    applySession: (session: Session | null) => void;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    isSignedIn: false,
    applySession: () => undefined,
});

export function useAuth() {
    const context = useContext(AuthContext);

    return context;
}
