import Text from "@/components/ui/text";
import { View } from "react-native";


export default function ErrorMessage({ message }: { message?: string | null }) {
    if (!message) return null;
    return (
        <View className="border-destructive card shadow-nb-destructive">
            <Text className="text-destructive text-center text-base font-medium">{message}</Text>
        </View>
    );
}
