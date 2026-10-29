import { useJoinParty } from "@/hooks/tan-stack/party-member";
import { useSearchParty } from "@/hooks/tan-stack/party";
import ErrorMessage from "@/components/error-message";
import BackButton from "@/components/back-button";
import { relativeTime } from "@/utils/formatters";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Button from "@/components/ui/button";
import { Users } from "lucide-react-native";
import Text from "@/components/ui/text";
import { router } from "expo-router";
import { View } from "react-native";
import { useState } from "react";


export default function JoinPartyScreen() {
    const [code, setCode] = useState("");
    const trimmedCode = code.trim().toUpperCase();

    const partyPreviewQuery = useSearchParty(trimmedCode, { enabled: trimmedCode.length >= 6 });

    const joinPartyMutation = useJoinParty({
        onSuccess: () => {
            router.replace(`/(app)/(tabs)/(party)/${trimmedCode}`);
        },
    });

    function handleJoin() {
        if (!trimmedCode) return;
        joinPartyMutation.mutate(trimmedCode);
    }

    return (
        <Screen fullscreen className="gap-5">
            <BackButton label="Join Party" />

            <View>
                <View className="gap-5">
                    <View className="gap-2">
                        <Text className="text-sm font-bold">Party Code</Text>
                        <Input placeholder="e.g. ABC1234" value={code} onChangeText={(text) => setCode(text.toUpperCase())} autoCapitalize="characters" autoCorrect={false} returnKeyType="done" onSubmitEditing={handleJoin} />
                    </View>

                    {trimmedCode.length >= 6 && (
                        <View className="border-foreground bg-card shadow-nb-sm border-2 p-4">
                            {partyPreviewQuery.isFetching ? (
                                <Text className="text-muted-foreground text-sm font-bold">Searching...</Text>
                            ) : partyPreviewQuery.data ? (
                                <View className="gap-3">
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className="text-base font-extrabold">{partyPreviewQuery.data.name}</Text>
                                            <Text className="text-muted-foreground text-xs font-bold">Created {relativeTime(partyPreviewQuery.data.createdAt)}</Text>
                                        </View>
                                        <View className="border-foreground bg-purple flex-row items-center gap-1 rounded-full border px-2.5 py-0.5">
                                            <Users size={12} color="#000" strokeWidth={2.5} />
                                            <Text className="text-xs font-bold">Party</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <Text className="text-muted-foreground text-sm font-bold">Party not found</Text>
                            )}
                        </View>
                    )}

                    <ErrorMessage message={joinPartyMutation.error?.message} />

                    <Button size={"lg"} onPress={handleJoin} disabled={joinPartyMutation.isPending || !trimmedCode}>
                        <Text>{joinPartyMutation.isPending ? "Joining..." : "Join Party"}</Text>
                    </Button>
                </View>
            </View>
        </Screen>
    );
}
