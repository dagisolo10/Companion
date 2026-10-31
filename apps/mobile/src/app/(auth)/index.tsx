import BrandMark from "@/components/common/brand-mark";
import Button from "@/components/ui/button";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { Link } from "expo-router";
import { ArrowRight, Compass, Swords, Trophy, Users } from "lucide-react-native";
import { View } from "react-native";

const features = [
    {
        icon: Swords,
        accent: "bg-amber",
        title: "Take on Quests",
        description: "Turn everyday goals into epic quests and earn XP as you go.",
    },
    {
        icon: Users,
        accent: "bg-lime",
        title: "Party Up",
        description: "Team up with friends, track progress together, and never grind alone.",
    },
    {
        icon: Trophy,
        accent: "bg-purple",
        title: "Level Up",
        description: "Climb the ranks from Novice to Mythic and prove your legend.",
    },
] as const;

export default function Welcome() {
    return (
        <Screen nonScrollable fullscreen className="justify-between gap-8 py-16">
            <View className="items-center justify-center gap-4">
                <BrandMark icon={Compass} accent="bg-amber" size="lg" />
                <View className="items-center gap-2">
                    <Text className="font-bebas text-center text-6xl">Companion</Text>
                    <Text className="text-muted-foreground font-jakarta-medium text-center text-lg">Your adventure companion for quests, parties, and leveling up every day.</Text>
                </View>
            </View>

            <View className="gap-3">
                {features.map(({ icon, accent, title, description }) => (
                    <View key={title} className="card flex-row items-center gap-3.5">
                        <BrandMark icon={icon} accent={accent} size="sm" />
                        <View className="flex-1">
                            <Text className="font-jakarta-bold text-xl">{title}</Text>
                            <Text className="text-muted-foreground font-jakarta-medium text-sm leading-snug">{description}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View className="gap-3">
                <Link href="/(auth)/sign-up" asChild>
                    <Button size="lg" right={ArrowRight}>
                        <Text className="font-bebas text-center text-3xl">Get Started</Text>
                    </Button>
                </Link>

                <Link href="/(auth)/sign-in" asChild>
                    <Button variant="outline" size="lg">
                        <Text className="font-bebas text-center text-3xl">I already have an account</Text>
                    </Button>
                </Link>
            </View>
        </Screen>
    );
}
