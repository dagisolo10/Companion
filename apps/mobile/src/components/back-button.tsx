import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import { useColor } from "@/hooks/custom/use-color";

export default function BackButton({ onPress }: { onPress?: () => void }) {
    const color = useColor();

    return (
        <Pressable onPress={onPress || (() => router.back())} className="border-foreground bg-card shadow-nb-sm h-10 w-10 items-center justify-center rounded-xl border-2">
            <ChevronLeft size={20} color={color.foreground} strokeWidth={2.5} />
        </Pressable>
    );
}
