import Button from "./ui/button";

import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

type SectionHeaderProps = {
    title: string;
    icon?: LucideIcon;
    iconColor?: string;
    action?: string;
    onAction?: () => void;
    badge?: string | number;
    badgeColor?: string;
};

export default function SectionHeader({ title, icon: Icon, iconColor, action, onAction, badge, badgeColor }: SectionHeaderProps) {
    const color = useColor();

    return (
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
                {Icon && <Icon size={20} color={iconColor || color.foreground} strokeWidth={2.5} />}
                <Text className="font-jakarta-extrabold text-xl tracking-tight">{title}</Text>
            </View>

            <View className="flex-row items-center gap-2">
                {badge !== undefined && (
                    <View className={cn(badgeColor || "bg-muted", "rounded-full border px-2.5 py-0.5")}>
                        <Text className="font-jakarta-extrabold text-xs">{badge}</Text>
                    </View>
                )}

                {action && onAction && (
                    <Button variant={"secondary"} size={"sm"} onPress={onAction}>
                        {action}
                    </Button>
                )}
            </View>
        </View>
    );
}
