import Text from "@/components/ui/text";
import { QuestStatus } from "@companion/shared-types";
import { cn } from "cn";
import { View } from "react-native";

export default function QuestStatusBadge({ status }: { status: QuestStatus }) {
    const color = status === "Completed" ? "bg-lime" : status === "Upcoming" ? "bg-purple" : status === "Expired" ? "bg-muted" : "bg-amber";
    return (
        <View className={cn(color, "border-foreground rounded-full border px-2.5 py-0.5")}>
            <Text className={cn("font-jakarta-extrabold text-[10px] uppercase", (status === "Completed" || status === "Upcoming" || status === "Active") && "text-black")}>{status}</Text>
        </View>
    );
}
