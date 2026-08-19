import Text from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import * as Haptics from "expo-haptics";
import { GestureResponderEvent, Pressable, PressableProps } from "react-native";

interface ButtonProps extends PressableProps, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    className?: string;
    textClassName?: string;
    onPressScale?: () => void;
    children: React.ReactNode;
}

const buttonVariants = cva("border-foreground rounded-2xl transition-all duration-300 active:translate-y-0.5 flex-row items-center justify-center gap-1 disabled:pointer-events-none disabled:opacity-70", {
    variants: {
        variant: {
            ghost: "bg-transparent",
            outline: "bg-card border-foreground border-2",
            success: "bg-lime shadow-nb active:shadow-nb-active border-2",
            default: "bg-amber shadow-nb active:shadow-nb-active border-2",
            secondary: "bg-secondary shadow-nb active:shadow-nb-active border-2",
            destructive: "bg-destructive shadow-nb active:shadow-nb-active border-2",
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

const textVariants = {
    default: "text-black",
    ghost: "text-foreground",
    success: "text-foreground",
    outline: "text-foreground",
    secondary: "text-secondary-foreground",
    destructive: "text-destructive-foreground",
} as const;

const textSizes = {
    lg: "text-lg",
    sm: "text-xs",
    icon: "text-base",
    "icon-lg": "text-base",
    default: "text-base",
} as const;

export default function Button({ variant = "default", size = "default", children, className, onPress, textClassName, onPressScale, asChild, ...props }: ButtonProps) {
    const handlePress = (e: GestureResponderEvent) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
    };

    return (
        <Pressable onPress={handlePress} className={cn(buttonVariants({ className, variant, size }))} {...props}>
            {asChild ? children : <Text className={cn(variant && textVariants[variant], size && textSizes[size], textClassName, "font-jakarta-bold")}>{children}</Text>}
        </Pressable>
    );
}
