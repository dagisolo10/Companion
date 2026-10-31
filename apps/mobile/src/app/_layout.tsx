import "@/app/global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack, usePathname, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SocketIoProvider from "@/providers/socket.io-provider";
import { ToastProvider } from "@/hooks/custom/use-toast";
import AuthProvider from "@/providers/auth-providers";
import * as SplashScreen from "expo-splash-screen";
import { useAuth } from "@/contexts/auth-context";
import { fonts } from "@/constants/fonts";
import { useFonts } from "expo-font";
import { useEffect } from "react";


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

        router.replace({ pathname: "/(app)/(tabs)/(home)" });
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
