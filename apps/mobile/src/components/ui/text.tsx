import { cn } from "@/lib/utils";
import { Text as RNText, TextProps } from "react-native";

export default function Text({ className, ...rest }: TextProps) {
    return <RNText className={cn("text-foreground", className)} {...rest} />;
}
