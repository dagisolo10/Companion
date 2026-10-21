import LeaderboardPodium from "@/components/leaderboard/leaderboard-podium";
import LeaderboardRow from "@/components/leaderboard/leaderboard-row";
import PartySelector from "@/components/party/party-selector";
import EmptyState from "@/components/ui/empty-state";
import Screen from "@/components/ui/screen";
import { SkeletonCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { useGetMyParties, useGetPartyLeaderboard } from "@/hooks/tan-stack/party";
import { useGetLeaderboard, useGetUser } from "@/hooks/tan-stack/user";
import { cn } from "@/lib/utils";
import { LeaderboardEntry, LeaderboardScope } from "@/types/leaderboard";
import { Party } from "@/types/models";
import { toLeaderboardEntry } from "@/utils/helper-functions";
import { router } from "expo-router";
import { Globe, Trophy, Users } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

export default function LeaderboardScreen() {
    const [scope, setScope] = useState<LeaderboardScope>("global");

    const userQuery = useGetUser();
    const partiesQuery = useGetMyParties();

    if (partiesQuery.isLoading || userQuery.isLoading) {
        return (
            <Screen className="gap-5">
                <View className="flex-row items-center gap-2">
                    <Trophy size={22} color="#ffba00" strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">Leaderboard</Text>
                </View>
                <ScopeToggle scope={scope} onChange={setScope} />
                <View className="mt-4 gap-3">
                    <SkeletonCard lines={2} />
                    <SkeletonCard lines={2} />
                    <SkeletonCard lines={2} />
                </View>
            </Screen>
        );
    }

    return (
        <Screen className="gap-5">
            <View className="flex-row items-center gap-2">
                <Trophy size={22} color="#ffba00" strokeWidth={2.5} />
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">Leaderboard</Text>
            </View>

            <ScopeToggle scope={scope} onChange={setScope} />

            <LeaderboardContent parties={partiesQuery.data ?? []} scope={scope} currentUserUsername={userQuery.data?.username} />
        </Screen>
    );
}

type LeaderboardContentProps = {
    parties: Party[];
    scope: LeaderboardScope;
    currentUserUsername: string | undefined;
};

function LeaderboardContent({ parties, scope, currentUserUsername }: LeaderboardContentProps) {
    const [showPartyPicker, setShowPartyPicker] = useState(false);
    const [pickedPartyCode, setPickedPartyCode] = useState<string | null>(null);

    const selectedPartyCode = (pickedPartyCode && parties.some(({ code }) => code === pickedPartyCode) ? pickedPartyCode : parties[0]?.code) ?? "";

    const globalLeaderboardQuery = useGetLeaderboard({ enabled: scope === "global" });
    const partyLeaderboardQuery = useGetPartyLeaderboard(selectedPartyCode, { enabled: scope === "party" && !!selectedPartyCode });

    const partyLeaderboard = partyLeaderboardQuery.data || [];
    const globalLeaderboard = globalLeaderboardQuery.data || [];
    const selectedParty = parties.find(({ code }) => code === selectedPartyCode);

    const entries: LeaderboardEntry[] = scope === "global" ? globalLeaderboard.map(toLeaderboardEntry) : partyLeaderboard.map(({ user }) => toLeaderboardEntry(user));

    const isPartyScopeWithoutParty = scope === "party" && parties.length === 0;
    const isLoading = scope === "global" ? globalLeaderboardQuery.isFetching : partyLeaderboardQuery.isFetching;
    const showPodium = entries.length >= 3;
    const rows = showPodium ? entries.slice(3) : entries;
    const firstRank = showPodium ? 4 : 1;

    if (isPartyScopeWithoutParty) {
        return <EmptyState icon={Users} title="No party yet" description="Join or create a party to see how you stack up against your teammates." actionLabel="Find a Party" onAction={() => router.push("/(app)/(parties)/join")} />;
    }

    return (
        <View className="flex-1 gap-5">
            {scope === "party" && (
                <PartySelector
                    selectedParty={selectedParty}
                    parties={parties}
                    showPartyPicker={showPartyPicker}
                    selectedPartyCode={selectedPartyCode}
                    onPick={() => setShowPartyPicker((c) => !c)}
                    onPartySelect={(code) => {
                        setShowPartyPicker(false);
                        setPickedPartyCode(code);
                    }}
                />
            )}

            {isLoading ? (
                <View className="gap-3">
                    <SkeletonCard lines={2} />
                    <SkeletonCard lines={2} />
                    <SkeletonCard lines={2} />
                </View>
            ) : entries.length === 0 ? (
                <EmptyState icon={Trophy} title="No players yet" description="Complete quests to earn XP and climb the leaderboard." />
            ) : (
                <>
                    {showPodium && (
                        <View>
                            <LeaderboardPodium entries={entries.slice(0, 3)} />
                        </View>
                    )}

                    <View className="gap-3">
                        <Text className="font-jakarta-extrabold text-lg tracking-tight">{scope === "global" ? "Top Players" : `${selectedParty?.name ?? "Party"} Rankings`}</Text>

                        {rows.map((entry, index) => (
                            <Pressable key={entry.id} onPress={() => router.push({ pathname: "/(app)/user/[username]", params: { username: entry.username } })}>
                                <LeaderboardRow entry={entry} rank={firstRank + index} isCurrentUser={entry.username === currentUserUsername} />
                            </Pressable>
                        ))}
                    </View>
                </>
            )}
        </View>
    );
}

function ScopeToggle({ scope, onChange }: { scope: LeaderboardScope; onChange: (scope: LeaderboardScope) => void }) {
    const color = useColor();

    const options: { value: LeaderboardScope; label: string; icon: typeof Globe }[] = [
        { value: "global", label: "Global", icon: Globe },
        { value: "party", label: "My Party", icon: Users },
    ];

    return (
        <View className="border-foreground bg-card shadow-nb flex-row rounded-2xl border-2 p-1">
            {options.map(({ value, label, icon: Icon }) => {
                const active = scope === value;

                return (
                    <Pressable key={value} onPress={() => onChange(value)} className={cn("flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5", active && "bg-amber")}>
                        <Icon size={16} color={active ? "#000000" : color.mutedForeground} strokeWidth={2.5} />
                        <Text className={cn("font-jakarta-extrabold text-sm", active ? "text-black" : "text-muted-foreground")}>{label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
