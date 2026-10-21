import { Stack } from "expo-router";

export default function AppLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="user/[username]" options={{ animation: "slide_from_right" }} />
        </Stack>
    );
}
