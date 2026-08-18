import "@/app/global.css";

import { useAuth } from "@/contexts/auth-context";
import AuthProvider from "@/providers/auth-providers";
import TokenProvider from "@/providers/token-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();

function ContentLayout() {
    const { isLoading, isSignedIn } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        if (!isSignedIn) return router.replace("/(auth)/sign-in");

        router.replace("/");
    }, [isLoading, isSignedIn]);

    if (isLoading) {
        return <ActivityIndicator size={"large"} />;
    }

    return (
        <Stack>
            <Stack.Protected guard={isSignedIn}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack.Protected>

            <Stack.Protected guard={!isSignedIn}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack.Protected>

            <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <TokenProvider>
                        <ContentLayout />
                    </TokenProvider>
                </AuthProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
