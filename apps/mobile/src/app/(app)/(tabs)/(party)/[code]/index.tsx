import { AlertTriangle, Check, CheckCircle2, Copy, Globe, LockKeyhole, LogOut, MessageCircle, Plus, ScrollText, Settings, Share2, Target, Trophy, UserPlus, Users } from "lucide-react-native";
import { useGetMembers, useJoinParty, useLeaveParty } from "@/hooks/tan-stack/party-member";
import * as Clipboard from "expo-clipboard";
import useToast from "@/hooks/custom/use-toast";
import { SkeletonCard, SkeletonQuestList } from "@/components/ui/skeleton";
import { useDeleteParty, useGetParty } from "@/hooks/tan-stack/party";
import { useGetPartyQuests } from "@/hooks/tan-stack/quest";
import { router, useLocalSearchParams } from "expo-router";
import SectionHeader from "@/components/common/section-header";
import ConfirmDialog from "@/components/common/confirm-dialog";
import EmptyState from "@/components/ui/empty-state";
import { useGetUser } from "@/hooks/tan-stack/user";
import { useColor } from "@/hooks/custom/use-color";
import BackButton from "@/components/common/back-button";
import { relativeTime } from "@/utils/formatters";
import QuestCard from "@/components/quest/quest-card";
import Screen from "@/components/ui/screen";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { Share, View } from "react-native";
import { useEffect, useState } from "react";
import { cn } from "cn";

const AVATAR_COLORS = ["bg-lime", "bg-pink", "bg-amber", "bg-purple"];

export default function PartyDetailScreen() {
    const color = useColor();

    const { code } = useLocalSearchParams<{ code: string }>();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (!codeCopied) return;

        const timeout = setTimeout(() => setCodeCopied(false), 2000);
        return () => clearTimeout(timeout);
    }, [codeCopied]);

    const partyQuery = useGetParty(code);
    const membersQuery = useGetMembers(code!);
    const questsQuery = useGetPartyQuests(code!);
    const userQuery = useGetUser();
    const deletePartyMutation = useDeleteParty({
        onSuccess: () => {
            setShowDeleteDialog(false);
            router.replace("/(app)/(tabs)/(party)");
        },
    });
    const leavePartyMutation = useLeaveParty({
        onSuccess: () => {
            setShowLeaveDialog(false);
            router.replace("/(app)/(tabs)/(party)");
        },
    });
    const joinPartyMutation = useJoinParty({
        onSuccess: () => showToast({ title: "Joined party", description: `You are now a member of ${partyQuery.data?.name ?? "this party"}.`, variant: "success" }),
        onError: (error) => showToast({ title: "Could not join party", description: error.message || "Please try again.", variant: "error" }),
    });

    function handleJoin() {
        if (!code) return;
        joinPartyMutation.mutate(code);
    }

    const isLoading = partyQuery.isFetching || membersQuery.isFetching || questsQuery.isFetching;

    if (isLoading) {
        return (
            <Screen className="gap-5">
                <BackButton label="Loading..." />
                <SkeletonCard lines={2} />
                <SkeletonQuestList count={2} />
            </Screen>
        );
    }

    if (!partyQuery.data || partyQuery.error) {
        return (
            <Screen className="gap-5">
                <BackButton label={partyQuery.error?.message ?? "Party not found"} />
            </Screen>
        );
    }

    const party = partyQuery.data;
    const members = membersQuery.data;
    const quests = questsQuery.data;
    const isCreator = userQuery.data?.id === party.creatorId;
    const activeQuests = quests.filter((q) => q.status === "Active");
    const upcomingQuests = quests.filter((q) => q.status === "Upcoming");
    const completedQuests = quests.filter((q) => q.status === "Completed");
    const memberPreview = members.slice(0, 5);

    async function handleCopyCode() {
        try {
            await Clipboard.setStringAsync(party.code);
            setCodeCopied(true);
        } catch {}
    }

    async function handleShareCode() {
        try {
            await Share.share({
                title: `Join ${party.name} on Companion`,
                message: `Join my party "${party.name}" on Companion.\n\nParty code: ${party.code}`,
            });
        } catch {}
    }

    return (
        <Screen className="gap-5">
            <BackButton label={party.name} />

            <View className="card flex-row items-center justify-between gap-3">
                <View className="flex-1 gap-1">
                    <View className="flex-row items-center gap-2">
                        <Text className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">Party Code</Text>
                        <View className={cn("flex-row items-center gap-1 px-2 py-1", party.public ? "bg-lime" : "bg-muted")}>
                            {party.public ? <Globe size={11} color="#000" strokeWidth={2.5} /> : <LockKeyhole size={11} color={color.foreground} strokeWidth={2.5} />}
                            <Text className={cn("text-[10px] font-bold uppercase", party.public && "text-black")}>{party.public ? "Public" : "Private"}</Text>
                        </View>
                    </View>
                    <Text selectable className="text-2xl font-extrabold tracking-widest">
                        {party.code}
                    </Text>
                </View>

                <View className="flex-row gap-2">
                    <Button size="icon" variant="outline" onPress={handleCopyCode} accessibilityLabel={codeCopied ? "Party code copied" : "Copy party code"}>
                        {codeCopied ? <Check size={18} color={color.lime} strokeWidth={3} /> : <Copy size={18} color={color.foreground} strokeWidth={2.5} />}
                    </Button>

                    <Button size="icon" variant="outline" onPress={handleShareCode} accessibilityLabel="Share party code">
                        <Share2 size={18} color={color.foreground} strokeWidth={2.5} />
                    </Button>
                </View>
            </View>

            <View className="card gap-3">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <Users size={18} color="#a855f7" strokeWidth={2.5} />
                        <Text className="text-base font-extrabold">
                            {members.length} Member{members.length !== 1 ? "s" : ""}
                        </Text>
                    </View>
                    <Text className="text-muted-foreground text-xs">Created {relativeTime(party.createdAt)}</Text>
                </View>

                {memberPreview.length > 0 && (
                    <View className="flex-row items-center gap-2">
                        {memberPreview.map((m, i) => (
                            <View key={m.id} className={cn(AVATAR_COLORS[i % AVATAR_COLORS.length], "border-foreground size-9 items-center justify-center border-2")}>
                                <Text className="text-xs font-extrabold text-black">{m.userId.charAt(0).toUpperCase()}</Text>
                            </View>
                        ))}
                        {members.length > 5 && (
                            <View className="border-foreground bg-muted size-9 items-center justify-center border-2">
                                <Text className="text-xs font-extrabold">+{members.length - 5}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

            <Button asChild onPress={() => router.push({ pathname: "/(app)/(tabs)/(chat)/[code]", params: { code } })}>
                <MessageCircle size={16} color="#000000" strokeWidth={2.5} />
                <Text className="text-sm font-bold">Party Chat</Text>
            </Button>

            <View className="gap-2">
                <View className="flex-row gap-3">
                    <Button className="flex-1" variant="outline" asChild onPress={() => router.push(`/(app)/(tabs)/(party)/${code}/members`)}>
                        <Users size={16} color={color.foreground} strokeWidth={2.5} />
                        <Text className="text-sm">Members</Text>
                    </Button>

                    <Button className="flex-1" variant="outline" asChild onPress={() => router.push(`/(app)/(tabs)/(party)/${code}/quests`)}>
                        <ScrollText size={16} color={color.foreground} strokeWidth={2.5} />
                        <Text className="text-sm">All Quests</Text>
                    </Button>
                </View>

                <View className="flex-row gap-3">
                    <Button className="flex-1" variant="outline" asChild onPress={() => router.push(`/(app)/(tabs)/(party)/${code}/leaderboard`)}>
                        <Trophy size={16} color={color.foreground} strokeWidth={2.5} />
                        <Text className="text-sm">Ranks</Text>
                    </Button>

                    <Button className="flex-1" asChild onPress={() => router.push({ pathname: "/(app)/(tabs)/(party)/[code]/quests/create", params: { code } })}>
                        <Plus size={16} strokeWidth={2.5} />
                        <Text className="dark:text-background text-sm">Quest</Text>
                    </Button>
                </View>
            </View>

            <View className="gap-3">
                {upcomingQuests.length > 0 && (
                    <View className="gap-3">
                        <SectionHeader title="Upcoming Quests" icon={Target} badge={`${upcomingQuests.length}`} badgeColor="bg-purple" />
                        {upcomingQuests.slice(0, 3).map((quest) => (
                            <QuestCard key={quest.id} quest={quest} showComplete={false} onPress={() => router.push({ pathname: "/(app)/(tabs)/(party)/[code]/quests/[id]", params: { id: quest.id, code } })} />
                        ))}
                    </View>
                )}
                <SectionHeader title="Active Quests" icon={Target} badge={`${activeQuests.length}`} badgeColor="bg-lime" />

                {activeQuests.length === 0 ? (
                    <EmptyState icon={Trophy} title="No active quests" description="Create a quest to get started!" actionLabel="Create Quest" onAction={() => router.push({ pathname: "/(app)/(tabs)/(party)/[code]/quests/create", params: { code } })} />
                ) : (
                    activeQuests.slice(0, 3).map((quest) => <QuestCard key={quest.id} quest={quest} onPress={() => router.push({ pathname: "/(app)/(tabs)/(party)/[code]/quests/[id]", params: { id: quest.id, code } })} />)
                )}
            </View>

            {completedQuests.length > 0 && (
                <View className="gap-3">
                    <SectionHeader title="Completed" icon={CheckCircle2} badge={`${completedQuests.length}`} badgeColor="bg-muted" />

                    {completedQuests.slice(0, 2).map((quest) => (
                        <QuestCard key={quest.id} quest={quest} onPress={() => router.push({ pathname: "/(app)/(tabs)/(party)/[code]/quests/[id]", params: { id: quest.id, code } })} />
                    ))}
                </View>
            )}

            {isCreator ? (
                <View className="gap-3">
                    <SectionHeader title="Manage Party" icon={Settings} iconColor="#ef4444" />
                    <Button variant="outline" asChild onPress={() => router.push(`/(app)/(tabs)/(party)/${code}/settings`)}>
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
                <Button variant="success" onPress={handleJoin} disabled={joinPartyMutation.isPending} asChild>
                    <UserPlus size={16} color="#000" strokeWidth={2.5} />
                    <Text className="font-extrabold text-black">{joinPartyMutation.isPending ? "Joining..." : "Join Party"}</Text>
                </Button>
            )}

            <ConfirmDialog
                destructive
                title="Delete Party"
                visible={showDeleteDialog}
                loading={deletePartyMutation.isPending}
                onCancel={() => setShowDeleteDialog(false)}
                onConfirm={() => deletePartyMutation.mutate(party.id)}
                confirmLabel={deletePartyMutation.isPending ? "Deleting..." : "Delete"}
                description={`Are you sure you want to delete "${party.name}"? This action cannot be undone and all members will be removed.`}
            />

            <ConfirmDialog
                destructive
                title="Leave Party"
                visible={showLeaveDialog}
                loading={leavePartyMutation.isPending}
                onCancel={() => setShowLeaveDialog(false)}
                onConfirm={() => leavePartyMutation.mutate(code!)}
                confirmLabel={leavePartyMutation.isPending ? "Leaving..." : "Leave"}
                description={`Are you sure you want to leave "${party.name}"? You can rejoin later with the party code.`}
            />
        </Screen>
    );
}
