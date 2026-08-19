import Screen from "./screen";

import { ActivityIndicator } from "react-native";

export default function LoadingScreen() {
    return (
        <Screen fullscreen className="items-center justify-center">
            <ActivityIndicator size={"large"} />
        </Screen>
    );
}
