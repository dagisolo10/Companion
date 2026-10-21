import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

type BrandMarkProps = {
    icon: LucideIcon;
    accent?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
    iconColor?: string;
};

const sizes = {
    sm: { box: "size-10 rounded-xl", icon: 20 },
    md: { box: "size-14 rounded-2xl", icon: 28 },
    lg: { box: "size-20 rounded-3xl", icon: 40 },
} as const;

export default function BrandMark({ icon: Icon, accent = "bg-amber", size = "md", className, iconColor = "#000000" }: BrandMarkProps) {
    const { box, icon } = sizes[size];

    return (
        <View className={cn("border-foreground shadow-nb items-center justify-center border-2", box, accent, className)}>
            <Icon size={icon} color={iconColor} strokeWidth={2.5} />
        </View>
    );
}
