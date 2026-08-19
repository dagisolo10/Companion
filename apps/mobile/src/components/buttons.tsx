import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { ArrowRight, Shield, Trash2, Zap } from "lucide-react-native";
import { View } from "react-native";

export default function ButtonShowcaseCard() {
    const color = useColor();
    return (
        <View className="border-foreground bg-card shadow-nb mb-8 gap-6 rounded-2xl border-2 p-5">
            <View className="border-border gap-1 border-b-2 pb-4">
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">Button Components</Text>
                <Text className="text-muted-foreground font-jakarta-bold text-xs">Neubrutalist design variants & interactive states</Text>
            </View>

            <View className="gap-3">
                <Text className="text-muted-foreground font-jakarta-extrabold text-xs tracking-wider uppercase">Color Variants</Text>

                <View className="gap-3">
                    <Button variant="default">Default (Lime)</Button>

                    <Button variant="secondary">Secondary</Button>

                    <Button variant="success">Success</Button>

                    <Button variant="outline">Outline</Button>

                    <Button variant="ghost">Ghost</Button>

                    <Button variant="destructive">Destructive</Button>
                </View>
            </View>

            <View className="border-border gap-3 border-t-2 pt-4">
                <Text className="text-muted-foreground font-jakarta-extrabold text-xs tracking-wider uppercase">Sizes</Text>

                <View className="items-start gap-3">
                    <Button size="lg" className="w-full">
                        Large Button (lg)
                    </Button>

                    <Button size="default" className="w-full">
                        Default Button
                    </Button>

                    <Button size="sm">Small (sm)</Button>
                </View>
            </View>

            <View className="border-border gap-3 border-t-2 pt-4">
                <Text className="text-muted-foreground font-jakarta-extrabold text-xs tracking-wider uppercase">With Icons & Custom Children</Text>

                <View className="flex-row flex-wrap items-center gap-3">
                    <Button variant="default" className="flex-1" asChild>
                        <Zap size={18} color={color.foreground} strokeWidth={2.5} />
                        <Text className="font-jakarta-extrabold text-black">Boost</Text>
                    </Button>

                    <Button variant="destructive" size="icon">
                        <Trash2 size={18} color={color.background} strokeWidth={2.5} />
                    </Button>

                    <Button variant="outline" size="icon">
                        <Shield size={18} color={color.foreground} fill={color.foreground} strokeWidth={2.5} />
                    </Button>
                </View>

                <Button variant="secondary" asChild>
                    <Text className="font-jakarta-extrabold">Next Step</Text>
                    <ArrowRight size={18} color={color.foreground} strokeWidth={2.5} />
                </Button>
            </View>

            <View className="border-border gap-3 border-t-2 pt-4">
                <Text className="text-muted-foreground font-jakarta-extrabold text-xs tracking-wider uppercase">Disabled State</Text>
                <Button disabled variant="default">
                    Disabled Button
                </Button>
            </View>
        </View>
    );
}
