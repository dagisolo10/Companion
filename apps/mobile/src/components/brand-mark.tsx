import { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { cn } from "cn";


type BrandMarkProps = {
    icon: LucideIcon;
    accent?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
    iconColor?: string;
};

const sizes = {
    sm: { box: "size-10", icon: 20 },
    md: { box: "size-14", icon: 28 },
    lg: { box: "size-20", icon: 40 },
} as const;

export default function BrandMark({ icon: Icon, accent = "bg-amber", size = "md", className, iconColor = "#000000" }: BrandMarkProps) {
    const { box, icon } = sizes[size];

    return (
        <View className={cn("border-foreground shadow-nb items-center justify-center border-2", box, accent, className)}>
            <Icon size={icon} color={iconColor} strokeWidth={2.5} />
        </View>
    );
}
