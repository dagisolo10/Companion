import BackButton from "@/components/back-button";
import ErrorMessage from "@/components/error-message";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useSearchParty } from "@/hooks/tan-stack/party";
import { useJoinParty } from "@/hooks/tan-stack/party-member";
import { relativeTime } from "@/utils/formatters";
import { router } from "expo-router";
import { Users } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

export default function JoinPartyScreen() {
    const [code, setCode] = useState("");
    const trimmedCode = code.trim().toUpperCase();

    const { data: partyPreview, isFetching: searching } = useSearchParty(trimmedCode, { enabled: trimmedCode.length >= 6 });

    const {
        mutate: joinParty,
        isPending,
        error,
    } = useJoinParty({
        onSuccess: () => {
            router.replace(`/(app)/(parties)/${trimmedCode}`);
        },
    });

    function handleJoin() {
        if (!trimmedCode) return;
        joinParty(trimmedCode);
    }

    return (
        <Screen nonScrollable className="gap-5">
            <View className="flex-row items-center gap-3">
                <BackButton />
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">Join Party</Text>
            </View>

            <View>
                <View className="gap-5">
                    <View className="gap-2">
                        <Text className="font-jakarta-bold text-sm">Party Code</Text>
                        <Input placeholder="e.g. ABC1234" value={code} onChangeText={(text) => setCode(text.toUpperCase())} autoCapitalize="characters" autoCorrect={false} returnKeyType="done" onSubmitEditing={handleJoin} />
                    </View>

                    {trimmedCode.length >= 6 && (
                        <View className="border-foreground bg-card shadow-nb-sm rounded-2xl border-2 p-4">
                            {searching ? (
                                <Text className="text-muted-foreground font-jakarta-bold text-sm">Searching...</Text>
                            ) : partyPreview ? (
                                <View className="gap-3">
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className="font-jakarta-extrabold text-base">{partyPreview.name}</Text>
                                            <Text className="text-muted-foreground font-jakarta-bold text-xs">Created {relativeTime(partyPreview.createdAt)}</Text>
                                        </View>
                                        <View className="border-foreground bg-purple flex-row items-center gap-1 rounded-full border px-2.5 py-0.5">
                                            <Users size={12} color="#000" strokeWidth={2.5} />
                                            <Text className="font-jakarta-bold text-xs">Party</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <Text className="text-muted-foreground font-jakarta-bold text-sm">Party not found</Text>
                            )}
                        </View>
                    )}

                    <ErrorMessage message={error?.message} />

                    <Button onPress={handleJoin} disabled={isPending || !trimmedCode}>
                        {isPending ? "Joining..." : "Join Party"}
                    </Button>
                </View>
            </View>
        </Screen>
    );
}
