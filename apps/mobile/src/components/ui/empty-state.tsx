import { useColor } from "@/hooks/custom/use-color";
import { LucideIcon } from "lucide-react-native";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { View } from "react-native";

type EmptyStateProps = {
    title: string;
    icon: LucideIcon;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
};

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    const color = useColor();

    return (
        <View className="items-center justify-center gap-4 py-12">
            <View className="border-foreground bg-muted shadow-nb-sm items-center justify-center border-2 p-5">
                <Icon size={32} color={color.mutedForeground} strokeWidth={1.5} />
            </View>

            <View className="items-center gap-1.5 px-4">
                <Text className="text-center text-lg font-extrabold">{title}</Text>
                <Text className="text-muted-foreground text-center text-sm font-bold">{description}</Text>
            </View>

            {actionLabel && onAction && (
                <Button onPress={onAction} size="sm">
                    <Text>{actionLabel}</Text>
                </Button>
            )}
        </View>
    );
}
