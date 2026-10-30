import { AlertTriangle, CheckCircle2, Info, LucideIcon, X, XCircle } from "lucide-react-native";
import { useColor } from "@/hooks/custom/use-color";
import { Pressable, View } from "react-native";
import Text from "@/components/ui/text";
import { cn } from "cn";


export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastProps = {
    title: string;
    icon?: LucideIcon;
    description?: string;
    variant?: ToastVariant;
    onDismiss?: () => void;
};

const variantStyles: Record<ToastVariant, { background: string; text: string; secondaryText: string; icon: LucideIcon; iconColor: "black" | "foreground" | "destructiveForeground" }> = {
    success: { background: "bg-lime", text: "text-black", secondaryText: "text-black/70", icon: CheckCircle2, iconColor: "black" },
    error: { background: "bg-destructive", text: "text-white", secondaryText: "text-white/80", icon: XCircle, iconColor: "destructiveForeground" },
    warning: { background: "bg-amber", text: "text-black", secondaryText: "text-black/70", icon: AlertTriangle, iconColor: "black" },
    info: { background: "bg-card", text: "text-foreground", secondaryText: "text-muted-foreground", icon: Info, iconColor: "foreground" },
};

export default function Toast({ title, description, variant = "info", icon, onDismiss }: ToastProps) {
    const color = useColor();
    const styles = variantStyles[variant];
    const Icon = icon ?? styles.icon;
    const iconColor = color[styles.iconColor];

    return (
        <View pointerEvents="box-none" className="absolute top-16 right-4 left-4 z-50">
            <View accessibilityRole="alert" className={cn("border-foreground shadow-nb flex-row items-center gap-3 border-2 p-4", styles.background)}>
                <View className="border-foreground bg-card h-10 w-10 items-center justify-center border-2">
                    <Icon size={20} color={iconColor} strokeWidth={2.5} />
                </View>
                <View className="flex-1 gap-0.5">
                    <Text className={cn("text-base font-extrabold", styles.text)}>{title}</Text>
                    {description ? <Text className={cn("text-xs font-bold", styles.secondaryText)}>{description}</Text> : null}
                </View>
                {onDismiss ? (
                    <Pressable accessibilityRole="button" accessibilityLabel="Dismiss notification" onPress={onDismiss} hitSlop={8}>
                        <X size={18} color={iconColor} strokeWidth={2.5} />
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}
