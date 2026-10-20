import { Colors } from "@/constants/colors";
import { useColorScheme } from "react-native";

export function useColor() {
    const scheme = useColorScheme();
    const theme = scheme === "unspecified" ? "light" : scheme;

    return Colors[theme];
}
