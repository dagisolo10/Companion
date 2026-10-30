import Text from "@/components/ui/text";
import { loadValue } from "@/utils/helper-functions";
import { cn } from "cn";
import { View } from "react-native";

type StatCardProps = {
    label: string;
    accent: string;
    loading: boolean;
    value: string | number;
};

export default function StatCard({ label, value, accent, loading }: StatCardProps) {
    return (
        <View className="card flex-1 justify-between gap-3">
            <View className={cn(accent, "border-foreground self-start border px-2 py-0.5")}>
                <Text className="text-[10px] font-bold text-black uppercase">{label}</Text>
            </View>
            <View>
                <Text className="text-2xl font-bold tracking-tight">{loadValue(loading, value)}</Text>
                <Text className="text-muted-foreground text-xs font-bold">{label}</Text>
            </View>
        </View>
    );
}
