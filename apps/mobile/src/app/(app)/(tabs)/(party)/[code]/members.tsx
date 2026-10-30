import { useGetMembersInfinite, useRemoveMember } from "@/hooks/tan-stack/party-member";
import { useGetParty, useTransferParty } from "@/hooks/tan-stack/party";
import useConfirmDialog from "@/hooks/custom/use-confirm-dialog";
import useToast from "@/hooks/custom/use-toast";
import { Crown, Shield, UserMinus, Users } from "lucide-react-native";
import { useFindUser, useGetUser } from "@/hooks/tan-stack/user";
import { router, useLocalSearchParams } from "expo-router";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import EmptyState from "@/components/ui/empty-state";
import BackButton from "@/components/common/back-button";
import { relativeTime } from "@/utils/formatters";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { useState } from "react";
import { cn } from "cn";

const AVATAR_COLORS = ["bg-lime", "bg-pink", "bg-amber", "bg-purple"];

export default function PartyMembersScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const [transferUsername, setTransferUsername] = useState("");
    const [showTransferInput, setShowTransferInput] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<string | null>(null);
    const { showConfirmDialog, confirmDialog } = useConfirmDialog();
    const { showToast } = useToast();

    const userQuery = useGetUser();
    const partyQuery = useGetParty(code!);
    const membersQuery = useGetMembersInfinite(code!);
    const searchingUserQuery = useFindUser(transferUsername, { enabled: transferUsername.length > 2 });
    const removeMemberMutation = useRemoveMember({
        onSuccess: () => {
            setRemoveTarget(null);
            showToast({ title: "Member removed", description: "They no longer have access to this party.", variant: "success" });
        },
        onError: (error) => showToast({ title: "Could not remove member", description: error.message || "Please try again.", variant: "error" }),
    });
    const transferPartyMutation = useTransferParty({
        onSuccess: () => {
            setShowTransferInput(false);
            setTransferUsername("");
            router.back();
        },
    });

    const isLoading = partyQuery.isFetching || membersQuery.isLoading;

    if (isLoading) {
        return (
            <Screen className="gap-5">
                <BackButton label="Members" />
                <SkeletonCard lines={2} />
            </Screen>
        );
    }

    const party = partyQuery.data;
    const members = membersQuery.data;
    const searchResult = searchingUserQuery.data;
    const isCurrentUserCreator = userQuery.data?.id === party?.creatorId;

    function handleRemove(memberId: string) {
        removeMemberMutation.mutate({ code: code!, data: { partyMemberId: memberId } });
    }

    function handleTransfer(memberId: string) {
        if (!party) return;
        showConfirmDialog({
            title: "Transfer Ownership",
            description: "Are you sure you want to transfer party ownership?",
            confirmLabel: "Transfer",
            onConfirm: () => transferPartyMutation.mutate({ id: party.id, data: { partyMemberId: memberId } }),
        });
    }

    function handleTransferByUsername() {
        if (!searchResult) return;
        const targetMember = members.find((m) => m.userId === searchResult.id);
        if (targetMember) {
            handleTransfer(targetMember.id);
        }
    }

    const matchedMember = searchResult ? members.find((m) => m.userId === searchResult.id) : null;

    return (
        <Screen nonScrollable>
            {confirmDialog}
            <FlatList
                style={{ flex: 1 }}
                data={members}
                keyExtractor={(member) => member.id}
                contentContainerStyle={{ gap: 12, paddingBottom: 24, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                onEndReached={() => {
                    if (membersQuery.hasNextPage && !membersQuery.isFetchingNextPage) void membersQuery.fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={
                    <View className="mb-2 gap-5">
                        <BackButton label="Members" />
                        {isCurrentUserCreator && (
                            <View className="gap-3">
                                <Button variant="outline" asChild onPress={() => setShowTransferInput(!showTransferInput)}>
                                    <Shield size={16} color="#000000" strokeWidth={2.5} />
                                    <Text className="text-sm font-bold">Transfer Ownership</Text>
                                </Button>

                                {showTransferInput && (
                                    <View className="gap-2">
                                        <Input placeholder="Enter username to transfer to" value={transferUsername} onChangeText={setTransferUsername} autoCapitalize="none" autoCorrect={false} />
                                        {searchResult && matchedMember && (
                                            <View className="border-lime bg-card flex-row items-center justify-between border-2 p-3">
                                                <Text className="text-sm font-bold">
                                                    {searchResult.name} (@{searchResult.username})
                                                </Text>
                                                <Button size="sm" onPress={handleTransferByUsername} disabled={transferPartyMutation.isPending}>
                                                    {transferPartyMutation.isPending ? "..." : "Transfer"}
                                                </Button>
                                            </View>
                                        )}
                                        {searchResult && !matchedMember && <Text className="text-muted-foreground text-xs font-bold">User is not in this party.</Text>}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item: member, index }) => {
                    const isCreator = member.userId === party?.creatorId;
                    const bgColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                    const initial = member.user.name.charAt(0).toUpperCase();

                    return (
                        <View key={member.id} className="shadow-nb-sm border-foreground border-2 p-4">
                            <Pressable onPress={() => router.push({ pathname: "/(app)/user/[username]", params: { username: member.user.username } })} className="flex-row items-center gap-3">
                                <View className={cn(bgColor, "border-foreground shadow-nb-sm h-12 w-12 items-center justify-center border-2")}>
                                    <Text className="text-lg font-extrabold text-black">{initial}</Text>
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-1.5">
                                        <Text className="text-sm font-extrabold">{member.user.name}</Text>
                                        {isCreator && <Crown size={12} color="#f59e0b" strokeWidth={2.5} />}
                                    </View>
                                    <Text className="text-muted-foreground text-xs font-bold">
                                        @{member.user.username} · Joined {relativeTime(member.joinedAt)}
                                    </Text>
                                </View>
                            </Pressable>

                            {isCurrentUserCreator && !isCreator && (
                                <View className="border-border mt-3 flex-row gap-2 border-t-2 pt-3">
                                    <Button size="sm" variant="destructive" asChild onPress={() => setRemoveTarget(member.id)}>
                                        <UserMinus size={14} color="#fff" strokeWidth={2.5} />
                                        <Text className="text-xs font-bold text-white">Remove</Text>
                                    </Button>
                                    <Button size="sm" variant="outline" asChild onPress={() => handleTransfer(member.id)} disabled={transferPartyMutation.isPending}>
                                        <Shield size={14} color="#000000" strokeWidth={2.5} />
                                        <Text className="text-xs font-bold">Transfer</Text>
                                    </Button>
                                </View>
                            )}
                        </View>
                    );
                }}
                ListEmptyComponent={<EmptyState icon={Users} title="No members" description="This party has no members yet." />}
                ListFooterComponent={
                    <>
                        {membersQuery.isFetchingNextPage && <ActivityIndicator />}
                        <ConfirmDialog
                            visible={!!removeTarget}
                            title="Remove Member"
                            description="Are you sure you want to remove this member from the party?"
                            confirmLabel={removeMemberMutation.isPending ? "Removing..." : "Remove"}
                            destructive
                            loading={removeMemberMutation.isPending}
                            onConfirm={() => removeTarget && handleRemove(removeTarget)}
                            onCancel={() => setRemoveTarget(null)}
                        />
                    </>
                }
            />
        </Screen>
    );
}
