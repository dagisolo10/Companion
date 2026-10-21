import BackButton from "@/components/back-button";
import ConfirmDialog from "@/components/confirm-dialog";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import { SkeletonCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useGetParty, useRegeneratePartyCode, useUpdateParty } from "@/hooks/tan-stack/party";
import { Party } from "@/types/models";
import { router, useLocalSearchParams } from "expo-router";
import { RefreshCw, Save } from "lucide-react-native";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function PartySettingsScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const { data: party, isFetching } = useGetParty(code!);

    if (isFetching) {
        return (
            <Screen className="gap-5">
                <View className="flex-row items-center gap-3">
                    <BackButton />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">Settings</Text>
                </View>
                <SkeletonCard lines={3} />
            </Screen>
        );
    }

    if (!party) {
        return (
            <Screen className="gap-5">
                <View className="flex-row items-center gap-3">
                    <BackButton />
                    <Text className="font-jakarta-extrabold text-2xl">Party not found</Text>
                </View>
            </Screen>
        );
    }

    return <PartySettingsForm party={party} />;
}

function PartySettingsForm({ party }: { party: Party }) {
    const { mutate: updateParty, isPending: updating } = useUpdateParty();
    const { mutate: regenerateCode, isPending: regenerating } = useRegeneratePartyCode();
    const [name, setName] = useState(party.name);
    const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

    function handleSave() {
        if (!name.trim()) {
            Alert.alert("Missing name", "Party name cannot be empty.");
            return;
        }
        updateParty(
            { id: party.id, data: { name: name.trim() } },
            {
                onSuccess: () => router.back(),
                onError: (err) => Alert.alert("Error", err.message),
            },
        );
    }

    function handleRegenerate() {
        regenerateCode(party.id, {
            onSuccess: ({ code }) => {
                setShowRegenerateDialog(false);
                router.push({ pathname: "/(app)/(tabs)/(parties)/[code]", params: { code } });
            },
            onError: (err) => Alert.alert("Error", err.message),
        });
    }

    return (
        <Screen className="gap-5">
            <View className="flex-row items-center gap-3">
                <BackButton />
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">Settings</Text>
            </View>

            <View className="gap-1.5">
                <Text className="text-sm">Party Name</Text>
                <Input placeholder="Party name" value={name} onChangeText={setName} />
            </View>

            <Button onPress={handleSave} disabled={updating || !name.trim()} asChild size={"lg"}>
                <Save size={16} color="#000" strokeWidth={2.5} />
                <Text>{updating ? "Saving..." : "Save Changes"}</Text>
            </Button>

            <View className="border-border border-t-2" />

            <View className="gap-2">
                <Text className="font-jakarta-extrabold text-lg tracking-tight">Danger Zone</Text>

                <Button variant="outline" onPress={() => setShowRegenerateDialog(true)} disabled={regenerating} asChild size={"lg"}>
                    <RefreshCw size={16} color="#000" strokeWidth={2.5} />
                    <Text>Regenerate Join Code</Text>
                </Button>

                <Text className="text-muted-foreground text-xs">Current code: {party.code}. Regenerating will invalidate the old code.</Text>
            </View>

            <ConfirmDialog
                visible={showRegenerateDialog}
                title="Regenerate Code"
                description={`Are you sure? The current code "${party.code}" will stop working. All members will need the new code to rejoin.`}
                confirmLabel={regenerating ? "Regenerating..." : "Regenerate"}
                loading={regenerating}
                onConfirm={handleRegenerate}
                onCancel={() => setShowRegenerateDialog(false)}
            />
        </Screen>
    );
}
