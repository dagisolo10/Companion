import { useColor } from "@/hooks/custom/use-color";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";
import Text from "@/components/ui/text";
import { router } from "expo-router";
import { cn } from "cn";


export default function BackButton({ onPress, className, label }: { onPress?: () => void; label: string; className?: string }) {
    const color = useColor();

    return (
        <View className="flex-row items-center gap-3">
            <Pressable onPress={onPress || (() => router.back())} className="border-foreground bg-card shadow-nb-sm size-10 items-center justify-center border-2">
                <ChevronLeft size={20} color={color.foreground} strokeWidth={2.5} />
            </Pressable>

            <Text className={cn("text-3xl font-bold tracking-tight", className)}>{label}</Text>
        </View>
    );
}
