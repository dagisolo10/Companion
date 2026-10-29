import { GestureResponderEvent, Pressable, PressableProps, View } from "react-native";
import { VariantProps, cva } from "class-variance-authority";
import { useColor } from "@/hooks/custom/use-color";
import { LucideIcon } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { cn } from "cn";

interface ButtonProps extends PressableProps, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    right?: LucideIcon;
    className?: string;
    children: React.ReactNode;
}

const buttonVariants = cva("border-foreground group/button transition-all duration-300 flex-row items-center justify-center gap-1 disabled:pointer-events-none disabled:opacity-70", {
    variants: {
        variant: {
            ghost: "bg-transparent",
            outline: "border-foreground border-2",
            success: "bg-lime shadow-nb active:shadow-nb-active active:translate-x-[1px] active:translate-y-[1px] border-2",
            default: "bg-amber shadow-nb active:shadow-nb-active active:translate-x-[1px] active:translate-y-[1px] border-2",
            secondary: "bg-secondary shadow-nb active:shadow-nb-active active:translate-x-[1px] active:translate-y-[1px] border-2",
            destructive: "bg-destructive shadow-nb active:shadow-nb-active active:translate-x-[1px] active:translate-y-[1px] border-2",
        },

        size: {
            icon: "size-12 p-0",
            "icon-lg": "size-13 p-0",
            lg: "h-16 px-6 min-w-[48px]",
            sm: "h-10 px-4 min-w-[24px]",
            default: "h-12 px-5 py-3 min-w-[42px]",
        },
    },

    defaultVariants: {
        size: "default",
        variant: "default",
    },
});

const sizeConfig = {
    sm: { wrapper: "size-10", iconSize: 15 },
    default: { wrapper: "size-12", iconSize: 18 },
    lg: { wrapper: "size-16", iconSize: 24 },
    icon: { wrapper: "size-12", iconSize: 18 },
    "icon-lg": { wrapper: "size-13", iconSize: 20 },
};

export default function Button({ variant = "default", size = "default", children, className, onPress, asChild, right: RightIcon, ...props }: ButtonProps) {
    const color = useColor();

    const handlePress = (e: GestureResponderEvent) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
    };

    const currentSizeConfig = sizeConfig[size || "default"];

    const content = RightIcon ? (
        <View className="flex-row items-center justify-between">
            <View className="flex-1">{children}</View>
            <View className={cn("bg-foreground items-center justify-center overflow-hidden", currentSizeConfig.wrapper)}>
                <View className="transition-transform duration-300 group-active/button:translate-x-1 group-active/button:scale-110">
                    <RightIcon size={currentSizeConfig.iconSize} color={color.background} />
                </View>
            </View>
        </View>
    ) : (
        children
    );

    return (
        <Pressable onPress={handlePress} className={cn(buttonVariants({ className, variant, size }), RightIcon ? "p-0" : "")} {...props}>
            {content}
        </Pressable>
    );
}
