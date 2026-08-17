import { Colors } from "@/constants/colors";
import { useColorScheme } from "react-native";

export function useColor() {
    const scheme = useColorScheme();

    return Colors[scheme === "light" ? "light" : "dark"];
}
