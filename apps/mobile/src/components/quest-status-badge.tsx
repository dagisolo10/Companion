import Text from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { QuestStatus } from "@/types/models";
import { View } from "react-native";

export default function QuestStatusBadge({ status }: { status: QuestStatus }) {
    return (
        <View className={cn(status === "Completed" ? "bg-lime" : "bg-amber", "border-foreground rounded-full border px-2.5 py-0.5")}>
            <Text className="font-jakarta-extrabold text-[10px] text-black uppercase">{status}</Text>
        </View>
    );
}
