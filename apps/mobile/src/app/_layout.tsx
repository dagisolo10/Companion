import "@/app/global.css";

import { fonts } from "@/constants/fonts";
import { useAuth } from "@/contexts/auth-context";
import { ToastProvider } from "@/hooks/custom/use-toast";
import AuthProvider from "@/providers/auth-providers";
import SocketIoProvider from "@/providers/socket.io-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { router, Stack, usePathname, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 2 } } });

const recoveryRoutes = ["/forgot-password", "/verify-reset", "/reset-password"];

function RootNavigator() {
    const { isLoading, isSignedIn, isPasswordRecovery } = useAuth();
    const pathname = usePathname();
    const segments = useSegments();
    const isAuthRoute = segments[0] === "(auth)";

    useEffect(() => {
        if (isLoading || isPasswordRecovery || !isSignedIn) return;

        router.replace("/(app)");
    }, [isLoading, isSignedIn, isPasswordRecovery]);

    useEffect(() => {
        if (isLoading || isPasswordRecovery || isSignedIn) return;
        if (isAuthRoute || recoveryRoutes.includes(pathname)) return;

        router.replace("/(auth)");
    }, [isAuthRoute, isLoading, isSignedIn, isPasswordRecovery, pathname]);

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
    const [loaded, error] = useFonts(fonts);

    useEffect(() => {
        if (loaded || error) {
            void SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <ToastProvider>
                        <SocketIoProvider>
                            <RootNavigator />
                        </SocketIoProvider>
                    </ToastProvider>
                </AuthProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
