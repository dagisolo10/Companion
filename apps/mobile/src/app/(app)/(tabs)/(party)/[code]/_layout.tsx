import { Stack } from "expo-router";


export default function PartyDetailLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="quests" />
            <Stack.Screen name="members" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="leaderboard" />
        </Stack>
    );
}
