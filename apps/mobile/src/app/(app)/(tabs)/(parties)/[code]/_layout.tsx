import { Stack } from "expo-router";

export default function PartyDetailLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="settings" />
        </Stack>
    );
}
