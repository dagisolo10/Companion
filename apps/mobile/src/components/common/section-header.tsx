import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { cn } from "cn";
import { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

type SectionHeaderProps = {
    title: string;
    action?: string;
    icon?: LucideIcon;
    iconColor?: string;
    badgeColor?: string;
    onAction?: () => void;
    badge?: string | number;
};

export default function SectionHeader({ title, icon: Icon, iconColor, action, onAction, badge, badgeColor }: SectionHeaderProps) {
    const color = useColor();

    return (
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
                {Icon && <Icon size={20} color={iconColor || color.foreground} strokeWidth={2.5} />}
                <Text className="font-jakarta-bold text-xl tracking-tight">{title}</Text>
            </View>

            <View className="flex-row items-center gap-2">
                {badge !== undefined && (
                    <View className={cn(badgeColor || "bg-muted", "border px-2.5 py-0.5")}>
                        <Text className="font-jakarta-bold text-xs">{badge}</Text>
                    </View>
                )}

                {action && onAction && (
                    <Button variant={"secondary"} size={"sm"} onPress={onAction}>
                        <Text>{action}</Text>
                    </Button>
                )}
            </View>
        </View>
    );
}
