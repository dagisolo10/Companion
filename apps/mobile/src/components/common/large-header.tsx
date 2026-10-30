import Text from "@/components/ui/text";
import { View } from "react-native";

export default function LargeHeader({ header }: { header: string }) {
    return (
        <View className="flex-row items-center gap-3 py-2">
            <Text className="text-5xl font-extrabold tracking-tight">{header}</Text>
        </View>
    );
}
