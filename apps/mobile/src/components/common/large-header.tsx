import Text from "@/components/ui/text";
import { View } from "react-native";

export default function LargeHeader({ header }: { header: string }) {
    return (
        <View className="flex-row items-center gap-3 py-2">
            <Text className="font-jakarta-extrabold text-5xl tracking-tight">{header}</Text>
        </View>
    );
}
