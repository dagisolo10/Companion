import { cn } from "cn";
import { Text as RNText, TextProps } from "react-native";

export default function Text({ className, ...rest }: TextProps) {
    return <RNText className={cn("text-foreground font-jakarta-semibold", className)} {...rest} />;
}
