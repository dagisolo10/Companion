import { Session, User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    isSignedIn: boolean;
    token: string | null;
    isPasswordRecovery: boolean;
    endPasswordRecovery: () => void;
    startPasswordRecovery: () => void;
    applySession: (session: Session | null) => void;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    isSignedIn: false,
    isPasswordRecovery: false,
    applySession: () => undefined,
    endPasswordRecovery: () => undefined,
    startPasswordRecovery: () => undefined,
});

export function useAuth() {
    const context = useContext(AuthContext);

    return context;
}
