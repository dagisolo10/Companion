import "./global.css";

import { useAuth } from "@/contexts/auth-context";
import AuthProvider from "@/providers/auth-providers";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
            <AuthProvider>
                <ContentLayout />
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
