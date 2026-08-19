import { useColor } from "@/hooks/custom/use-color";
import { cn } from "@/lib/utils";
import { TextInput, TextInputProps } from "react-native";

export const Input = ({ className, ...props }: TextInputProps & { className?: string }) => {
    const color = useColor();

    return <TextInput placeholderTextColor={color.mutedForeground} className={cn("border-border bg-muted text-foreground caret-muted-foreground h-14 w-full rounded-2xl pr-4 pl-4", className)} {...props} />;
};
