import { useGetParty, useGetPartyLeaderboard } from "@/hooks/tan-stack/party";
import LeaderboardPodium from "@/components/leaderboard/leaderboard-podium";
import LeaderboardRow from "@/components/leaderboard/leaderboard-row";
import { toLeaderboardEntry } from "@/utils/helper-functions";
import { router, useLocalSearchParams } from "expo-router";
import { SkeletonCard } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import { useGetUser } from "@/hooks/tan-stack/user";
import BackButton from "@/components/back-button";
import { Pressable, View } from "react-native";
import { Trophy } from "lucide-react-native";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";


export default function PartyLeaderboardScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();

    const partyQuery = useGetParty(code!);
    const userQuery = useGetUser();
    const partyLeaderboardQuery = useGetPartyLeaderboard(code ?? "");

    const entries = partyLeaderboardQuery.data.map((member) => toLeaderboardEntry(member.user));

    const showPodium = entries.length >= 3;
    const rows = showPodium ? entries.slice(3) : entries;
    const firstRank = showPodium ? 4 : 1;

    return (
        <Screen className="gap-5">
            <View className="flex-row items-center">
                <BackButton label="" />

                <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                        <Trophy size={20} color="#ffba00" strokeWidth={2.5} />
                        <Text className="text-2xl font-extrabold tracking-tight">Leaderboard</Text>
                    </View>
                    <Text className="text-muted-foreground text-xs">{partyQuery.data?.name ?? "Party"}</Text>
                </View>
            </View>

            {partyLeaderboardQuery.isFetching ? (
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
                        <Text className="text-lg font-extrabold tracking-tight">Rankings</Text>

                        {rows.map((entry, index) => (
                            <Pressable key={entry.id} onPress={() => router.push({ pathname: "/(app)/user/[username]", params: { username: entry.username } })}>
                                <LeaderboardRow entry={entry} rank={firstRank + index} isCurrentUser={entry.username === userQuery.data?.username} />
                            </Pressable>
                        ))}
                    </View>
                </>
            )}
        </Screen>
    );
}
