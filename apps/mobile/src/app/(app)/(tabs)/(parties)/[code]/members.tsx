import BackButton from "@/components/back-button";
import ConfirmDialog from "@/components/confirm-dialog";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import { SkeletonCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useGetParty, useTransferParty } from "@/hooks/tan-stack/party";
import { useGetMembers, useRemoveMember } from "@/hooks/tan-stack/party-member";
import { useFindUser, useGetUser } from "@/hooks/tan-stack/user";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/utils/formatters";
import { router, useLocalSearchParams } from "expo-router";
import { Crown, Shield, UserMinus, Users } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";

const AVATAR_COLORS = ["bg-lime", "bg-pink", "bg-amber", "bg-purple"];

export default function PartyMembersScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const [removeTarget, setRemoveTarget] = useState<string | null>(null);
    const [showTransferInput, setShowTransferInput] = useState(false);
    const [transferUsername, setTransferUsername] = useState("");

    const { data: party, isFetching: fetchingParty } = useGetParty(code!);
    const { data: members = [], isFetching: fetchingMembers } = useGetMembers(code!);
    const { data: user } = useGetUser();
    const { data: searchResult } = useFindUser(transferUsername, {
        enabled: transferUsername.length > 2,
    });
    const { mutate: removeMember, isPending: removing } = useRemoveMember({
        onSuccess: () => setRemoveTarget(null),
    });
    const { mutate: transferParty, isPending: transferring } = useTransferParty({
        onSuccess: () => {
            setShowTransferInput(false);
            setTransferUsername("");
            router.back();
        },
    });

    const isLoading = fetchingParty || fetchingMembers;

    if (isLoading) {
        return (
            <Screen className="gap-5">
                <View className="flex-row items-center gap-3">
                    <BackButton />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">Members</Text>
                </View>
                <SkeletonCard lines={2} />
            </Screen>
        );
    }

    const isCurrentUserCreator = user?.id === party?.creatorId;

    function handleRemove(memberId: string) {
        removeMember({ code: code!, data: { partyMemberId: memberId } });
    }

    function handleTransfer(memberId: string) {
        if (!party) return;
        Alert.alert("Transfer Ownership", "Are you sure you want to transfer party ownership?", [
            { text: "Cancel", style: "cancel" },
            { text: "Transfer", onPress: () => transferParty({ id: party.id, data: { partyMemberId: memberId } }) },
        ]);
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
        <Screen className="gap-5">
            <View className="flex-row items-center gap-3">
                <BackButton />
                <View className="flex-1">
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">Members</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-xs">
                        {members.length} member{members.length !== 1 ? "s" : ""}
                    </Text>
                </View>
            </View>

            {isCurrentUserCreator && (
                <View className="gap-3">
                    <Button variant="outline" asChild onPress={() => setShowTransferInput(!showTransferInput)}>
                        <Shield size={16} color="#000000" strokeWidth={2.5} />
                        <Text className="font-jakarta-bold text-sm">Transfer Ownership</Text>
                    </Button>

                    {showTransferInput && (
                        <View className="gap-2">
                            <Input placeholder="Enter username to transfer to" value={transferUsername} onChangeText={setTransferUsername} autoCapitalize="none" autoCorrect={false} />
                            {searchResult && matchedMember && (
                                <View className="border-lime bg-card flex-row items-center justify-between rounded-2xl border-2 p-3">
                                    <Text className="font-jakarta-bold text-sm">
                                        {searchResult.name} (@{searchResult.username})
                                    </Text>
                                    <Button size="sm" onPress={handleTransferByUsername} disabled={transferring}>
                                        {transferring ? "..." : "Transfer"}
                                    </Button>
                                </View>
                            )}
                            {searchResult && !matchedMember && <Text className="text-muted-foreground font-jakarta-bold text-xs">User is not in this party.</Text>}
                        </View>
                    )}
                </View>
            )}

            <View className="gap-3">
                {members.map((member, index) => {
                    const isCreator = member.userId === party?.creatorId;
                    const bgColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                    const initial = member.user.name.charAt(0).toUpperCase();

                    return (
                        <View key={member.id} className="shadow-nb-sm border-foreground rounded-2xl border-2 p-4">
                            <Pressable onPress={() => router.push({ pathname: "/(app)/user/[username]", params: { username: member.user.username } })} className="flex-row items-center gap-3">
                                <View className={cn(bgColor, "border-foreground shadow-nb-sm h-12 w-12 items-center justify-center rounded-xl border-2")}>
                                    <Text className="font-jakarta-extrabold text-lg text-black">{initial}</Text>
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-1.5">
                                        <Text className="font-jakarta-extrabold text-sm">{member.user.name}</Text>
                                        {isCreator && <Crown size={12} color="#f59e0b" strokeWidth={2.5} />}
                                    </View>
                                    <Text className="text-muted-foreground font-jakarta-bold text-xs">
                                        @{member.user.username} · Joined {relativeTime(member.joinedAt)}
                                    </Text>
                                </View>
                            </Pressable>

                            {isCurrentUserCreator && !isCreator && (
                                <View className="border-border mt-3 flex-row gap-2 border-t-2 pt-3">
                                    <Button size="sm" variant="destructive" asChild onPress={() => setRemoveTarget(member.id)}>
                                        <UserMinus size={14} color="#fff" strokeWidth={2.5} />
                                        <Text className="font-jakarta-bold text-xs text-white">Remove</Text>
                                    </Button>
                                    <Button size="sm" variant="outline" asChild onPress={() => handleTransfer(member.id)} disabled={transferring}>
                                        <Shield size={14} color="#000000" strokeWidth={2.5} />
                                        <Text className="font-jakarta-bold text-xs">Transfer</Text>
                                    </Button>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>

            {members.length === 0 && <EmptyState icon={Users} title="No members" description="This party has no members yet." />}

            <ConfirmDialog
                visible={!!removeTarget}
                title="Remove Member"
                description="Are you sure you want to remove this member from the party?"
                confirmLabel={removing ? "Removing..." : "Remove"}
                destructive
                loading={removing}
                onConfirm={() => removeTarget && handleRemove(removeTarget)}
                onCancel={() => setRemoveTarget(null)}
            />
        </Screen>
    );
}
