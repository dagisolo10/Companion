import { Text as RNText, TextProps } from "react-native";
import { cn } from "cn";


export default function Text({ className, ...rest }: TextProps) {
    return <RNText className={cn("text-foreground font-semibold", className)} {...rest} />;
}
