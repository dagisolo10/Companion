import "@/app/global.css";

import { fonts } from "@/constants/fonts";
import { useAuth } from "@/contexts/auth-context";
import AuthProvider from "@/providers/auth-providers";
import TokenProvider from "@/providers/token-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();

function ContentLayout() {
    const { isLoading, isSignedIn } = useAuth();
    const [fontsLoaded] = useFonts(fonts);

    useEffect(() => {
        if (isLoading) return;

        if (!isSignedIn) return router.replace("/(auth)/sign-in");

        router.replace("/(app)");
    }, [isLoading, isSignedIn]);

    if (isLoading || !fontsLoaded) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size={"large"} />
            </View>
        );
    }

    return (
        <Stack>
            <Stack.Protected guard={isSignedIn}>
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
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
