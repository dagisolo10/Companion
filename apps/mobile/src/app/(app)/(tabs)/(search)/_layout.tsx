import { useColor } from "@/hooks/custom/use-color";
import { router, Stack } from "expo-router";


export default function SearchLayout() {
    const color = useColor();

    return (
        <Stack
            screenOptions={{
                headerShadowVisible: false,
                headerTintColor: color.foreground,
                headerStyle: { backgroundColor: color.background },
                headerLargeStyle: { backgroundColor: color.background },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerLargeTitle: true,
                    headerTransparent: false,
                    headerTitle: "Find Players",
                    headerSearchBarOptions: {
                        autoCapitalize: "none",
                        placeholder: "Search by name or username",
                        onCancelButtonPress: () => router.setParams({ query: "" }),
                        onChangeText: (event) => router.setParams({ query: event.nativeEvent.text }),
                    },
                }}
            />
        </Stack>
    );
}
