import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Flame, Sparkles, Users } from "lucide-react-native";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

const MOCK_USER = {
    xp: 3820,
    level: 7,
    streakDays: 14,
    name: "Dagmawi",
    nextLevelXp: 5000,
    multiplier: "2.5x",
    title: "Shadow Knight",
};

const MOCK_PARTY_1 = [
    { id: "1", name: "Dagmawi", initial: "D", bg: "bg-lime", status: "In Quest ⚔️", isOnline: true },
    { id: "2", name: "Sarah", initial: "S", bg: "bg-pink", status: "Online 🟢", isOnline: true },
    { id: "3", name: "Alex", initial: "A", bg: "bg-[#00F0FF]", status: "Idle 💤", isOnline: false },
];

const MOCK_ACTIVITIES = [
    { id: "a1", user: "Sarah", text: "slayed '10k Steps'", xp: "+300 XP", badgeBg: "bg-lime" },
    { id: "a2", user: "Alex", text: "created '30m Guitar Practice'", xp: "NEW", badgeBg: "bg-pink" },
];

const MOCK_PARTY = {
    name: "Night Owls 🦉",
    code: "NW-8921",
    members: [
        { id: "1", name: "Dagmawi", role: "Leader", initial: "D", bg: "bg-amber" },
        { id: "2", name: "Sarah", role: "Member", initial: "S", bg: "bg-lime" },
        { id: "3", name: "Alex", role: "Member", initial: "A", bg: "bg-pink" },
    ],
};

export default function CompanionDarkHome() {
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        pulseScale.value = withRepeat(withSequence(withTiming(1.08, { duration: 800 }), withTiming(1, { duration: 800 })), -1, true);
    }, [pulseScale]);

    const pulseAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

    return (
        <Screen className="gap-6">
            <Animated.View entering={FadeInDown.duration(400)}>
                <View className="gap-4">
                    <View className="flex-row items-center gap-2">
                        <Text className="font-jakarta-extrabold text-3xl tracking-tight">Hey, {MOCK_USER.name}</Text>

                        <Animated.View style={pulseAnimStyle}>
                            <View className="shadow-nb border-foreground flex-row items-center gap-1 rounded-full border-2 bg-[#FF5500] px-2 py-0.5">
                                <Flame size={14} color="#000000" fill="#000000" />
                                <Text className="font-jakarta-extrabold text-xs text-white">{MOCK_USER.streakDays}d</Text>
                            </View>
                        </Animated.View>
                    </View>

                    <Text className="font-jakarta-bold text-muted-foreground text-xs tracking-wide uppercase">
                        {MOCK_USER.title} • Level {MOCK_USER.level}
                    </Text>
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                <View className="gap-3">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <Users size={20} color="#00F0FF" strokeWidth={2.5} />
                            <Text className="font-jakarta-extrabold text-xl tracking-tight">Party Radar</Text>
                        </View>
                        <Text className="font-jakarta-bold text-muted-foreground text-xs">Night Owls 🦉</Text>
                    </View>

                    <View className="shadow-nb border-foreground gap-3 rounded-2xl border-2 p-4">
                        <View className="flex-row items-center justify-between">
                            {MOCK_PARTY_1.map((member) => (
                                <View key={member.id} className="flex-1 items-center gap-1.5">
                                    <View className={`border-foreground h-12 w-12 rounded-2xl border-2 ${member.bg} shadow-nb relative items-center justify-center`}>
                                        <Text className="font-jakarta-extrabold text-lg text-black">{member.initial}</Text>
                                        {member.isOnline && <View className="border-foreground absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 bg-[#00FF66]" />}
                                    </View>
                                    <Text className="font-jakarta-extrabold text-xs">{member.name}</Text>
                                    <Text className="font-jakarta-bold text-muted-foreground text-[10px]">{member.status}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).duration(400)}>
                <View className="mb-6 gap-3">
                    <Text className="font-jakarta-extrabold text-xl tracking-tight">Live Guild Feed</Text>
                    <View className="shadow-nb border-foreground gap-2 rounded-2xl border-2 p-3">
                        {MOCK_ACTIVITIES.map((act) => (
                            <View key={act.id} className="flex-row items-center justify-between py-1">
                                <View className="flex-1 flex-row items-center gap-2 pr-2">
                                    <View className={`border-foreground border ${act.badgeBg} rounded-lg p-1.5`}>
                                        <Sparkles size={14} color="#000000" strokeWidth={2.5} />
                                    </View>
                                    <Text className="font-jakarta-bold flex-1 text-xs" numberOfLines={1}>
                                        <Text className="font-jakarta-extrabold">{act.user}</Text> {act.text}
                                    </Text>
                                </View>
                                <Text className="font-jakarta-extrabold text-lime text-xs">{act.xp}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(700).duration(400)}>
                <View className="gap-3">
                    <Text className="font-jakarta-extrabold text-xl tracking-tight">Current Party</Text>
                    <View className="border-foreground bg-card shadow-nb gap-3 rounded-2xl border-2 p-4">
                        <View className="flex-row items-center justify-between">
                            <Text className="font-jakarta-extrabold text-base">{MOCK_PARTY.name}</Text>
                            <Text className="text-muted-foreground font-jakarta-bold text-xs">Code: {MOCK_PARTY.code}</Text>
                        </View>

                        <View className="flex-row items-center gap-3">
                            {MOCK_PARTY.members.map((member) => (
                                <View key={member.id} className="items-center gap-1">
                                    <View className={cn(member.bg, "border-foreground shadow-nb h-10 w-10 items-center justify-center rounded-xl border-2")}>
                                        <Text className="font-jakarta-extrabold text-base text-black">{member.initial}</Text>
                                    </View>
                                    <Text className="font-jakarta-bold text-xs">{member.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </Animated.View>
        </Screen>
    );
}
