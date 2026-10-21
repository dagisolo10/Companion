import BackButton from "@/components/back-button";
import LeaderboardPodium from "@/components/leaderboard/leaderboard-podium";
import LeaderboardRow from "@/components/leaderboard/leaderboard-row";
import EmptyState from "@/components/ui/empty-state";
import Screen from "@/components/ui/screen";
import { SkeletonCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useGetParty, useGetPartyLeaderboard } from "@/hooks/tan-stack/party";
import { useGetUser } from "@/hooks/tan-stack/user";
import { toLeaderboardEntry } from "@/utils/helper-functions";
import { router, useLocalSearchParams } from "expo-router";
import { Trophy } from "lucide-react-native";
import { Pressable, View } from "react-native";

export default function PartyLeaderboardScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();

    const { data: party } = useGetParty(code!);
    const { data: user } = useGetUser();
    const { data: members = [], isFetching } = useGetPartyLeaderboard(code ?? "");

    const entries = members.map((member) => toLeaderboardEntry(member.user));

    const showPodium = entries.length >= 3;
    const rows = showPodium ? entries.slice(3) : entries;
    const firstRank = showPodium ? 4 : 1;

    return (
        <Screen className="gap-5">
            <View className="flex-row items-center gap-3">
                <BackButton onPress={() => router.back()} />
                <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                        <Trophy size={20} color="#ffba00" strokeWidth={2.5} />
                        <Text className="font-jakarta-extrabold text-2xl tracking-tight">Leaderboard</Text>
                    </View>
                    <Text className="text-muted-foreground text-xs">{party?.name ?? "Party"}</Text>
                </View>
            </View>

            {isFetching ? (
                <View className="gap-3">
                    <SkeletonCard lines={2} />
                    <SkeletonCard lines={2} />
                    <SkeletonCard lines={2} />
                </View>
            ) : entries.length === 0 ? (
                <EmptyState icon={Trophy} title="No rankings yet" description="Members will appear here as they join the party and earn XP." />
            ) : (
                <>
                    {showPodium && (
                        <View>
                            <LeaderboardPodium entries={entries.slice(0, 3)} />
                        </View>
                    )}

                    <View className="gap-3">
                        <Text className="font-jakarta-extrabold text-lg tracking-tight">Rankings</Text>

                        {rows.map((entry, index) => (
                            <Pressable key={entry.id} onPress={() => router.push({ pathname: "/(app)/user/[username]", params: { username: entry.username } })}>
                                <LeaderboardRow entry={entry} rank={firstRank + index} isCurrentUser={entry.username === user?.username} />
                            </Pressable>
                        ))}
                    </View>
                </>
            )}
        </Screen>
    );
}
