import { useColor } from "@/hooks/custom/use-color";
import { router, Stack } from "expo-router";

export default function SearchLayout() {
    const color = useColor();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                headerShadowVisible: false,
                headerTintColor: color.foreground,
                headerStyle: { backgroundColor: color.background },
                headerLargeStyle: { backgroundColor: color.background },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: true,
                    headerLargeTitle: true,
                    headerTransparent: false,
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: color.background,
                    },
                    headerLargeStyle: {
                        backgroundColor: color.background,
                    },
                    headerTitle: "Find Players",
                    headerSearchBarOptions: {
                        autoFocus: true,
                        autoCapitalize: "none",
                        placeholder: "Search by name or username",
                        onCancelButtonPress: () => router.setParams({ query: "" }),
                        onChangeText: (event) => router.setParams({ query: event.nativeEvent.text }),
                    },
                }}
            />

            <Stack.Screen name="[username]" options={{ headerTitle: "Profile", headerLargeTitle: false }} />
        </Stack>
    );
}
