import { TextInput, TextInputProps, View } from "react-native";
import { useColor } from "@/hooks/custom/use-color";
import { LucideIcon } from "lucide-react-native";
import { ReactNode } from "react";
import { cn } from "cn";


type InputProps = TextInputProps & {
    className?: string;
};

export const Input = ({ className, ...props }: InputProps) => {
    const color = useColor();

    return <TextInput placeholderTextColor={color.mutedForeground} className={cn("border-border bg-muted text-foreground caret-muted-foreground h-14 w-full border pr-4 pl-4 font-semibold", className)} {...props} />;
};

type InputFieldProps = InputProps & {
    icon: LucideIcon;
    right?: ReactNode;
};

export function InputField({ className, right, icon: Icon, ...props }: InputFieldProps) {
    const color = useColor();

    return (
        <View className="border-foreground relative flex-row border">
            <View className="bg-muted border-foreground size-14 items-center justify-center border-r">
                <Icon color={color.foreground} size={20} />
            </View>

            <Input className={cn("flex-1 border-0", className)} {...props} />
            {right}
        </View>
    );
}
