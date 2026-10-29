import "@/app/global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthProvider from "@/providers/auth-providers";
import { useAuth } from "@/contexts/auth-context";
import { router, Stack } from "expo-router";
import { useEffect } from "react";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 2 } } });

function RootNavigator() {
    const { isLoading, isSignedIn } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        if (!isSignedIn) {
            router.replace("/(auth)");
        } else {
            router.replace("/(app)");
        }
    }, [isLoading, isSignedIn]);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={isSignedIn}>
                <Stack.Screen name="(app)" />
            </Stack.Protected>

            <Stack.Protected guard={!isSignedIn}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="verify-reset" />
                <Stack.Screen name="forgot-password" />
            </Stack.Protected>

            <Stack.Screen name="reset-password" />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <RootNavigator />
                </AuthProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
