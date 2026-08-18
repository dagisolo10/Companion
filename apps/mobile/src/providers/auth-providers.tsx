import { AuthContext } from "@/contexts/auth-context";
import { useGetUser } from "@/hooks/tan-stack/user";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { PropsWithChildren, useEffect, useState } from "react";
import { AppState } from "react-native";

export default function AuthProvider({ children }: PropsWithChildren) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSignedIn, setIsSignedIn] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useGetUser();

    useEffect(() => {
        const listener = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                supabase.auth.startAutoRefresh();
            } else {
                supabase.auth.stopAutoRefresh();
            }
        });

        return () => listener.remove();
    }, []);

    useEffect(() => {
        async function initializeAuth() {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Error getting session:", error);
            }

            if (data.session) {
                setIsSignedIn(true);
                setUser(data.session.user);
                setToken(data.session.access_token);
            } else {
                setUser(null);
                setToken(null);
                setIsSignedIn(false);
            }

            setIsLoading(false);
        }

        initializeAuth();

        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", { event });

            if (session) {
                setIsSignedIn(true);
                setUser(session.user);
                setToken(session.access_token);
            } else {
                setUser(null);
                setToken(null);
                setIsSignedIn(false);
            }
        });

        return () => data.subscription.unsubscribe();
    }, []);

    return <AuthContext.Provider value={{ user, token, isLoading, isSignedIn }}>{children}</AuthContext.Provider>;
}
