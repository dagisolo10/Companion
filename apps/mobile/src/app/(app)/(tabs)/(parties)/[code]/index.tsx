import BackButton from "@/components/back-button";
import ConfirmDialog from "@/components/confirm-dialog";
import QuestCard from "@/components/quest-card";
import SectionHeader from "@/components/section-header";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import Screen from "@/components/ui/screen";
import { SkeletonCard, SkeletonQuestList } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { useDeleteParty, useGetParty } from "@/hooks/tan-stack/party";
import { useGetMembers, useJoinParty, useLeaveParty } from "@/hooks/tan-stack/party-member";
import { useGetPartyQuests } from "@/hooks/tan-stack/quest";
import { useGetUser } from "@/hooks/tan-stack/user";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/utils/formatters";
import { router, useLocalSearchParams } from "expo-router";
import { AlertTriangle, CheckCircle2, LogOut, Plus, ScrollText, Settings, Target, Trophy, UserPlus, Users } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

const AVATAR_COLORS = ["bg-lime", "bg-pink", "bg-amber", "bg-purple"];

export default function PartyDetailScreen() {
    const color = useColor();

    const { code } = useLocalSearchParams<{ code: string }>();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);

    const { data: party, error: partyError, isFetching: fetchingParty } = useGetParty(code);
    const { data: members = [], isFetching: fetchingMembers } = useGetMembers(code!);
    const { data: quests = [], isFetching: fetchingQuests } = useGetPartyQuests(code!);
    const { data: user } = useGetUser();
    const { mutate: deleteParty, isPending: deleting } = useDeleteParty({
        onSuccess: () => {
            setShowDeleteDialog(false);
            router.replace("/(app)/(parties)");
        },
    });
    const { mutate: leaveParty, isPending: leaving } = useLeaveParty({
        onSuccess: () => {
            setShowLeaveDialog(false);
            router.replace("/(app)/(parties)");
        },
    });
    const { mutate: joinParty, isPending: joining } = useJoinParty();

    function handleJoin() {
        if (!code) return;
        joinParty(code);
    }

    const isLoading = fetchingParty || fetchingMembers || fetchingQuests;

    if (isLoading) {
        return (
            <Screen className="gap-5">
                <View className="flex-row items-center gap-3">
                    <BackButton />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">Loading...</Text>
                </View>
                <SkeletonCard lines={2} />
                <SkeletonQuestList count={2} />
            </Screen>
        );
    }

    if (!party || partyError) {
        return (
            <Screen className="gap-5">
                <View className="flex-row items-center gap-3">
                    <BackButton />
                    <Text className="font-jakarta-extrabold text-2xl">{partyError?.message ?? "Party not found"}</Text>
                </View>
            </Screen>
        );
    }

    const isCreator = user?.id === party.creatorId;
    const activeQuests = quests.filter((q) => q.status === "Active");
    const completedQuests = quests.filter((q) => q.status === "Completed");
    const memberPreview = members.slice(0, 5);

    return (
        <Screen className="gap-5">
            <View className="flex-row items-center gap-3">
                <BackButton />
                <View className="flex-1">
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">{party.name}</Text>
                    <Text className="text-muted-foreground text-xs">Code: {party.code}</Text>
                </View>
            </View>

            <View className="shadow-nb border-foreground gap-3 rounded-2xl border-2 p-4">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <Users size={18} color="#a855f7" strokeWidth={2.5} />
                        <Text className="font-jakarta-extrabold text-base">
                            {members.length} Member{members.length !== 1 ? "s" : ""}
                        </Text>
                    </View>
                    <Text className="text-muted-foreground text-xs">Created {relativeTime(party.createdAt)}</Text>
                </View>

                {memberPreview.length > 0 && (
                    <View className="flex-row items-center gap-2">
                        {memberPreview.map((m, i) => (
                            <View key={m.id} className={cn(AVATAR_COLORS[i % AVATAR_COLORS.length], "border-foreground size-9 items-center justify-center rounded-lg border-2")}>
                                <Text className="font-jakarta-extrabold text-xs text-black">{m.userId.charAt(0).toUpperCase()}</Text>
                            </View>
                        ))}
                        {members.length > 5 && (
                            <View className="border-foreground bg-muted size-9 items-center justify-center rounded-lg border-2">
                                <Text className="font-jakarta-extrabold text-xs">+{members.length - 5}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

            <View className="gap-2">
                <View className="flex-row gap-3">
                    <Button className="flex-1" variant="outline" asChild onPress={() => router.push(`/(app)/(parties)/${code}/members`)}>
                        <Users size={16} color={color.foreground} strokeWidth={2.5} />
                        <Text className="text-sm">Members</Text>
                    </Button>

                    <Button className="flex-1" variant="outline" asChild onPress={() => router.push(`/(app)/(parties)/${code}/quests`)}>
                        <ScrollText size={16} color={color.foreground} strokeWidth={2.5} />
                        <Text className="text-sm">All Quests</Text>
                    </Button>
                </View>

                <View className="flex-row gap-3">
                    <Button className="flex-1" variant="outline" asChild onPress={() => router.push(`/(app)/(parties)/${code}/leaderboard`)}>
                        <Trophy size={16} color={color.foreground} strokeWidth={2.5} />
                        <Text className="text-sm">Ranks</Text>
                    </Button>

                    <Button className="flex-1" asChild onPress={() => router.push({ pathname: "/(app)/(tabs)/(home)/(quests)/create", params: { partyCode: code } })}>
                        <Plus size={16} strokeWidth={2.5} />
                        <Text className="dark:text-background text-sm">Quest</Text>
                    </Button>
                </View>
            </View>

            <View className="gap-3">
                <SectionHeader title="Active Quests" icon={Target} badge={`${activeQuests.length}`} badgeColor="bg-lime" />

                {activeQuests.length === 0 ? (
                    <EmptyState icon={Trophy} title="No active quests" description="Create a quest to get started!" actionLabel="Create Quest" onAction={() => router.push({ pathname: "/(app)/(tabs)/(home)/(quests)/create", params: { partyCode: code } })} />
                ) : (
                    activeQuests.slice(0, 3).map((quest) => <QuestCard key={quest.id} quest={quest} onPress={() => router.push({ pathname: "/(app)/(tabs)/(home)/(quests)/[id]", params: { id: quest.id, code } })} />)
                )}
            </View>

            {completedQuests.length > 0 && (
                <View className="gap-3">
                    <SectionHeader title="Completed" icon={CheckCircle2} badge={`${completedQuests.length}`} badgeColor="bg-muted" />

                    {completedQuests.slice(0, 2).map((quest) => (
                        <QuestCard key={quest.id} quest={quest} onPress={() => router.push({ pathname: "/(app)/(tabs)/(home)/(quests)/[id]", params: { id: quest.id, code } })} />
                    ))}
                </View>
            )}

            {isCreator ? (
                <View className="gap-3">
                    <SectionHeader title="Manage Party" icon={Settings} iconColor="#ef4444" />

                    <Button variant="outline" asChild onPress={() => router.push(`/(app)/(parties)/${code}/settings`)}>
                        <Settings size={16} color="#000000" strokeWidth={2.5} />
                        <Text className="text-sm">Party Settings</Text>
                    </Button>

                    <Button variant="destructive" onPress={() => setShowDeleteDialog(true)} asChild>
                        <AlertTriangle size={16} color="#fff" strokeWidth={2.5} />
                        <Text className="text-sm text-white">Delete Party</Text>
                    </Button>
                </View>
            ) : party.isMember ? (
                <Button variant="outline" onPress={() => setShowLeaveDialog(true)} asChild>
                    <LogOut size={16} color="#DC2626" strokeWidth={2.5} />
                    <Text className="text-destructive text-sm">Leave Party</Text>
                </Button>
            ) : (
                <Button variant="success" onPress={handleJoin} disabled={joining} asChild>
                    <UserPlus size={16} color="#000" strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-black">{joining ? "Joining..." : "Join Party"}</Text>
                </Button>
            )}

            <ConfirmDialog
                visible={showDeleteDialog}
                title="Delete Party"
                description={`Are you sure you want to delete "${party.name}"? This action cannot be undone and all members will be removed.`}
                confirmLabel={deleting ? "Deleting..." : "Delete"}
                destructive
                loading={deleting}
                onConfirm={() => deleteParty(party.id)}
                onCancel={() => setShowDeleteDialog(false)}
            />

            <ConfirmDialog
                visible={showLeaveDialog}
                title="Leave Party"
                description={`Are you sure you want to leave "${party.name}"? You can rejoin later with the party code.`}
                confirmLabel={leaving ? "Leaving..." : "Leave"}
                destructive
                loading={leaving}
                onConfirm={() => leaveParty(code!)}
                onCancel={() => setShowLeaveDialog(false)}
            />
        </Screen>
    );
}
