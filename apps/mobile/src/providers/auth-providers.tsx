import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { updateRememberedAccountSession } from "@/lib/auth/remembered-accounts";
import { useQueryClient } from "@tanstack/react-query";
import { Session, User } from "@supabase/supabase-js";
import { injectTokenResolver } from "@/lib/api/axios";
import { AuthContext } from "@/contexts/auth-context";
import { useGetUser } from "@/hooks/tan-stack/user";
import { supabase } from "@/lib/supabase";
import { AppState } from "react-native";


export default function AuthProvider({ children }: PropsWithChildren) {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(true);
    const [isSignedIn, setIsSignedIn] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const activeUserId = useRef<string | null>(null);

    const applySession = useCallback(
        (session: Session | null) => {
            const nextUserId = session?.user.id ?? null;
            if (activeUserId.current && activeUserId.current !== nextUserId) {
                void queryClient.resetQueries();
            }
            activeUserId.current = nextUserId;
            const nextToken = session?.access_token ?? null;
            injectTokenResolver(() => nextToken);
            setIsSignedIn(session !== null);
            setUser(session?.user ?? null);
            setToken(nextToken);
        },
        [queryClient],
    );

    useGetUser();

    useEffect(() => {
        injectTokenResolver(() => token);
    }, [token]);

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
                void updateRememberedAccountSession(data.session).catch(() => undefined);
                applySession(data.session);
            } else {
                applySession(null);
            }

            setIsLoading(false);
        }

        initializeAuth();

        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                void updateRememberedAccountSession(session).catch(() => undefined);
                applySession(session);
            } else {
                applySession(null);
            }
        });

        return () => data.subscription.unsubscribe();
    }, [applySession]);

    return <AuthContext.Provider value={{ user, token, isLoading, isSignedIn, applySession }}>{children}</AuthContext.Provider>;
}
