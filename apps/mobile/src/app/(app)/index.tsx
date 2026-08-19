import ErrorMessage from "@/components/error-message";
import Button from "@/components/ui/button";
import LoadingScreen from "@/components/ui/loading-screen";
import ProgressBar from "@/components/ui/progress-bar";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { useGetUser } from "@/hooks/tan-stack/user";
import { cn } from "@/lib/utils";
import { getLevel } from "@/utils/helper-functions";
import { Activity, Award, CheckCircle2, Flame, Moon, Plus, Sparkles, Sun, Target, Users, Zap } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Appearance, ColorSchemeName, useColorScheme, View } from "react-native";
import Animated, { FadeInDown, FadeInRight, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

const MOCK_USER = {
    weeklyXpEarned: 650,
    questsCompletedThisWeek: 4,
};

const MOCK_ACTIVITIES = [
    {
        id: "a1",
        title: "Completed 'Morning Run'",
        detail: "+150 XP • Personal Quest",
        time: "2h ago",
        bg: "bg-lime",
        icon: CheckCircle2,
    },
    {
        id: "a2",
        title: "Alex assigned you a quest",
        detail: "Read 20 pages • 'Night Owls' Party",
        time: "5h ago",
        bg: "bg-amber",
        icon: Sparkles,
    },
    {
        id: "a3",
        title: "Earned 'Weekly Warrior' Badge",
        detail: "+50 XP Bonus",
        time: "1d ago",
        bg: "bg-pink",
        icon: Award,
    },
];

const MOCK_QUESTS = [
    {
        id: "q1",
        title: "5K Night Run",
        creator: "Sarah",
        difficulty: "Hard",
        reward: 450,
        difficultyBg: "bg-pink",
    },
    {
        id: "q2",
        title: "Read 30 Pages of Architecture",
        creator: "Alex",
        difficulty: "Normal",
        reward: 200,
        difficultyBg: "bg-[#00F0FF]",
    },
    {
        id: "q3",
        title: "No Sugar All Day",
        creator: "Dagmawi",
        difficulty: "Tiny",
        reward: 100,
        difficultyBg: "bg-lime",
    },
];

export default function Home() {
    const color = useColor();
    const scheme = useColorScheme();
    const [theme, setTheme] = useState<ColorSchemeName>(scheme);

    const { data: user, error, isFetching } = useGetUser();

    function toggle() {
        setTheme((theme) => (theme === "dark" ? "light" : "dark"));
        Appearance.setColorScheme(theme);
    }

    const pulseScale = useSharedValue(1);

    useEffect(() => {
        pulseScale.value = withRepeat(withSequence(withTiming(1.08, { duration: 800 }), withTiming(1, { duration: 800 })), -1, true);
    }, [pulseScale]);

    if (error) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <ErrorMessage message={error.message} />
            </Screen>
        );
    }

    if (isFetching) {
        return <LoadingScreen />;
    }

    if (!user) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <ErrorMessage message={"User not found"} />
            </Screen>
        );
    }

    const xpProgressPercent = Math.min(100, Math.round((user.experience / getLevel(user.experience).nextLevelXp) * 100));

    return (
        <Screen className="gap-6">
            <View className="flex-row items-center justify-between">
                <View className="gap-0.5">
                    <Text className="font-jakarta-extrabold text-foreground text-3xl tracking-tight">Hey, {user.name} 👋</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-sm">Ready to level up today?</Text>
                </View>

                <View className="flex-row items-center gap-2">
                    <Button size="icon" variant="secondary" onPress={toggle}>
                        {theme === "dark" ? <Sun size={20} color={color.foreground} strokeWidth={2.5} /> : <Moon size={20} color={color.foreground} strokeWidth={2.5} />}
                    </Button>
                </View>
            </View>

            <View className="border-foreground bg-amber shadow-nb flex-row items-center justify-between rounded-2xl border-2 p-3.5">
                <View className="flex-1 flex-row items-center gap-3">
                    <View className="rounded-xl border-2 border-black bg-white p-2">
                        <Flame size={20} color={color.destructive} fill={color.destructive} strokeWidth={2.5} />
                    </View>
                    <View className="flex-1">
                        <Text className="font-jakarta-extrabold text-xs tracking-wider text-black uppercase">Daily Momentum</Text>
                        <Text className="font-jakarta-bold text-sm text-black">Keep going — {user.streak}-day streak active!</Text>
                    </View>
                </View>
            </View>

            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <View className="border-foreground shadow-nb gap-3 rounded-2xl border-2 p-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2.5">
                            <View className="border-foreground bg-purple rounded-xl border-2 p-2">
                                <Zap size={20} color={color.white} strokeWidth={2.5} />
                            </View>
                            <View>
                                <Text className="font-jakarta-extrabold text-xl leading-none">Level {getLevel(user.experience).level}</Text>
                                <Text className="text-muted-foreground font-jakarta-bold mt-0.5 text-xs">Adventurer</Text>
                            </View>
                        </View>
                        <View className="border-foreground bg-muted rounded-full border-2 px-3 py-1">
                            <Text className="font-jakarta-extrabold text-xs">
                                {user.experience} / {getLevel(user.experience).nextLevelXp} XP
                            </Text>
                        </View>
                    </View>

                    <View className="gap-1.5">
                        <ProgressBar value={xpProgressPercent} />

                        <View className="flex-row items-center justify-between">
                            <Text className="font-jakarta-bold text-xs">XP BAR</Text>
                            <Text className="text-muted-foreground font-jakarta-bold text-right text-[11px]">
                                {getLevel(user.experience).nextLevelXp - user.experience} XP to Level {getLevel(user.experience).nextLevel}
                            </Text>
                        </View>
                    </View>
                </View>
            </Animated.View>

            <View className="flex-row gap-3">
                <View className="border-foreground bg-card shadow-nb flex-1 justify-between gap-3 rounded-2xl border-2 p-4">
                    <View className="border-foreground bg-lime self-start rounded-md border px-2 py-0.5">
                        <Text className="font-jakarta-extrabold text-[10px] text-black uppercase">Weekly</Text>
                    </View>
                    <View>
                        <Text className="font-jakarta-extrabold text-2xl tracking-tight">{MOCK_USER.questsCompletedThisWeek}</Text>
                        <Text className="text-muted-foreground font-jakarta-bold text-xs">Quests Completed</Text>
                    </View>
                </View>

                <View className="border-foreground bg-card shadow-nb flex-1 justify-between gap-3 rounded-2xl border-2 p-4">
                    <View className="border-foreground bg-pink self-start rounded-md border px-2 py-0.5">
                        <Text className="font-jakarta-extrabold text-[10px] text-black uppercase">Gained</Text>
                    </View>
                    <View>
                        <Text className="font-jakarta-extrabold text-2xl tracking-tight">+{MOCK_USER.weeklyXpEarned}</Text>
                        <Text className="text-muted-foreground font-jakarta-bold text-xs">XP Earned Recently</Text>
                    </View>
                </View>
            </View>

            <View className="gap-2.5">
                <Text className="font-jakarta-extrabold text-xl tracking-tight">Quick Actions</Text>
                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <Button size="lg" className="bg-amber w-full" asChild>
                            <Plus size={18} color={color.black} strokeWidth={3} />
                            <Text className="font-jakarta-extrabold text-black">Create Quest</Text>
                        </Button>
                    </View>
                    <View className="flex-1">
                        <Button size="lg" variant="outline" className="w-full" asChild>
                            <Users size={18} color={color.foreground} strokeWidth={2.5} />
                            <Text className="font-jakarta-extrabold">View Parties</Text>
                        </Button>
                    </View>
                </View>
            </View>

            <View className="mb-4 gap-3">
                <View className="flex-row items-center justify-between">
                    <Text className="font-jakarta-extrabold text-xl tracking-tight">Recent Activity</Text>
                    <View className="flex-row items-center gap-1">
                        <Activity size={14} color={color.mutedForeground} />
                        <Text className="text-muted-foreground font-jakarta-bold text-xs">Global History</Text>
                    </View>
                </View>

                <View className="border-foreground bg-card shadow-nb divide-border/60 rounded-2xl border-2 p-2">
                    {MOCK_ACTIVITIES.map((act, index) => {
                        const IconComponent = act.icon;
                        return (
                            <View key={act.id} className={cn("flex-row items-center justify-between p-2.5", index !== MOCK_ACTIVITIES.length - 1 && "border-border border-b")}>
                                <View className="flex-1 flex-row items-center gap-3">
                                    <View className={cn(act.bg, "border-foreground rounded-xl border-2 p-2")}>
                                        <IconComponent size={16} color={color.black} strokeWidth={2.5} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-jakarta-bold text-foreground text-sm" numberOfLines={1}>
                                            {act.title}
                                        </Text>
                                        <Text className="text-muted-foreground font-jakarta-bold text-xs">{act.detail}</Text>
                                    </View>
                                </View>
                                <Text className="text-muted-foreground font-jakarta-bold ml-2 text-[11px]">{act.time}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                <View className="gap-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <Target size={20} color={color.lime} strokeWidth={2.5} />
                            <Text className="font-jakarta-extrabold text-xl tracking-tight">Active Quests</Text>
                        </View>
                        <View className="border-foreground bg-lime rounded-full border px-2.5 py-0.5">
                            <Text className="font-jakarta-extrabold text-xs text-black">{MOCK_QUESTS.length} Pending</Text>
                        </View>
                    </View>

                    {MOCK_QUESTS.map((quest, index) => (
                        <Animated.View key={quest.id} entering={FadeInRight.delay(500 + index * 100).duration(400)}>
                            <View className="shadow-nb border-foreground gap-3 rounded-2xl border-2 p-4">
                                <View className="flex-row items-start justify-between gap-2">
                                    <View className="flex-1 gap-1">
                                        <Text className="font-jakarta-extrabold text-base">{quest.title}</Text>
                                        <Text className="font-jakarta-bold text-muted-foreground text-xs">
                                            By <Text className="text-[#00F0FF]">{quest.creator}</Text>
                                        </Text>
                                    </View>

                                    <View className={cn(quest.difficultyBg, "border-foreground rounded-md border px-2.5 py-0.5")}>
                                        <Text className="font-jakarta-extrabold text-xs text-black uppercase">{quest.difficulty}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between border-t-2 border-zinc-800 pt-2">
                                    <View className="flex-row items-center gap-1.5">
                                        <Award size={16} color={color.lime} strokeWidth={2.5} />
                                        <Text className="font-jakarta-extrabold text-lime text-sm">+{quest.reward} XP</Text>
                                    </View>

                                    <Button asChild size={"sm"}>
                                        <CheckCircle2 size={14} color={"#000000"} strokeWidth={2.5} />
                                        <Text className="font-jakarta-extrabold text-xs text-black">Complete</Text>
                                    </Button>
                                </View>
                            </View>
                        </Animated.View>
                    ))}
                </View>
            </Animated.View>
        </Screen>
    );
}
