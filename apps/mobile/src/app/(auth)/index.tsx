import { ArrowRight, Compass, Swords, Trophy, Users } from "lucide-react-native";
import BrandMark from "@/components/common/brand-mark";
import Screen from "@/components/ui/screen";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { View } from "react-native";
import { Link } from "expo-router";

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
                    <Text className="text-muted-foreground text-center text-lg font-medium">Your adventure companion for quests, parties, and leveling up every day.</Text>
                </View>
            </View>

            <View className="gap-3">
                {features.map(({ icon, accent, title, description }) => (
                    <View key={title} className="card flex-row items-center gap-3.5">
                        <BrandMark icon={icon} accent={accent} size="sm" />
                        <View className="flex-1">
                            <Text className="text-xl font-bold">{title}</Text>
                            <Text className="text-muted-foreground text-sm leading-snug font-medium">{description}</Text>
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
