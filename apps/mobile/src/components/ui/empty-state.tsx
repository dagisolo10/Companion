import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

type EmptyStateProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
};

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    const color = useColor();

    return (
        <View className="items-center justify-center gap-4 py-12">
            <View className="border-foreground bg-muted shadow-nb-sm items-center justify-center rounded-2xl border-2 p-5">
                <Icon size={32} color={color.mutedForeground} strokeWidth={1.5} />
            </View>

            <View className="items-center gap-1.5 px-4">
                <Text className="font-jakarta-extrabold text-center text-lg">{title}</Text>
                <Text className="text-muted-foreground font-jakarta-bold text-center text-sm">{description}</Text>
            </View>

            {actionLabel && onAction && (
                <Button onPress={onAction} size="sm">
                    {actionLabel}
                </Button>
            )}
        </View>
    );
}
