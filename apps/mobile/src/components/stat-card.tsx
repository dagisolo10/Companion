import { cn } from "@/lib/utils";
import { View } from "react-native";
import Text from "@/components/ui/text";

type StatCardProps = {
    label: string;
    value: string | number;
    accent?: string;
};

export default function StatCard({ label, value, accent }: StatCardProps) {
    return (
        <View className="card flex-1 justify-between gap-3">
            {accent && (
                <View className={cn(accent, "border-foreground self-start rounded-md border px-2 py-0.5")}>
                    <Text className="font-jakarta-extrabold text-[10px] text-black uppercase">{label.split(" ")[0]}</Text>
                </View>
            )}
            <View>
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">{value}</Text>
                <Text className="text-muted-foreground font-jakarta-bold text-xs">{label}</Text>
            </View>
        </View>
    );
}
