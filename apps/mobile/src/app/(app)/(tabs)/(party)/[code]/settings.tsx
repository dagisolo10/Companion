import { useGetParty, useRegeneratePartyCode, useUpdateParty } from "@/hooks/tan-stack/party";
import { router, useLocalSearchParams } from "expo-router";
import ConfirmDialog from "@/components/confirm-dialog";
import { SkeletonCard } from "@/components/ui/skeleton";
import { RefreshCw, Save } from "lucide-react-native";
import BackButton from "@/components/back-button";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Button from "@/components/ui/button";
import { Alert, View } from "react-native";
import Text from "@/components/ui/text";
import { Party } from "@/types/models";
import { useState } from "react";


export default function PartySettingsScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const partyQuery = useGetParty(code!);

    if (partyQuery.isFetching) {
        return (
            <Screen className="gap-5">
                <BackButton label="Settings" />
                <SkeletonCard lines={3} />
            </Screen>
        );
    }

    if (!partyQuery.data) {
        return (
            <Screen className="gap-5">
                <BackButton label="Party not found" />
            </Screen>
        );
    }

    return <PartySettingsForm party={partyQuery.data} />;
}

function PartySettingsForm({ party }: { party: Party }) {
    const updatePartyMutation = useUpdateParty();
    const regenerateCodeMutation = useRegeneratePartyCode();
    const [name, setName] = useState(party.name);
    const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

    function handleSave() {
        if (!name.trim()) {
            Alert.alert("Missing name", "Party name cannot be empty.");
            return;
        }
        updatePartyMutation.mutate(
            { id: party.id, data: { name: name.trim() } },
            {
                onSuccess: () => router.back(),
                onError: (err) => Alert.alert("Error", err.message),
            },
        );
    }

    function handleRegenerate() {
        regenerateCodeMutation.mutate(party.id, {
            onSuccess: ({ code }) => {
                setShowRegenerateDialog(false);
                router.push({ pathname: "/(app)/(tabs)/(party)/[code]", params: { code } });
            },
            onError: (err) => Alert.alert("Error", err.message),
        });
    }

    return (
        <Screen className="gap-5">
            <BackButton label="Settings" />

            <View className="gap-1.5">
                <Text className="text-sm">Party Name</Text>
                <Input placeholder="Party name" value={name} onChangeText={setName} />
            </View>

            <Button onPress={handleSave} disabled={updatePartyMutation.isPending || !name.trim()} asChild size={"lg"}>
                <Save size={16} color="#000" strokeWidth={2.5} />
                <Text>{updatePartyMutation.isPending ? "Saving..." : "Save Changes"}</Text>
            </Button>

            <View className="border-border border-t-2" />

            <View className="gap-2">
                <Text className="text-lg font-extrabold tracking-tight">Danger Zone</Text>

                <Button variant="outline" onPress={() => setShowRegenerateDialog(true)} disabled={regenerateCodeMutation.isPending} asChild size={"lg"}>
                    <RefreshCw size={16} color="#000" strokeWidth={2.5} />
                    <Text>Regenerate Join Code</Text>
                </Button>

                <Text className="text-muted-foreground text-xs">Current code: {party.code}. Regenerating will invalidate the old code.</Text>
            </View>

            <ConfirmDialog
                visible={showRegenerateDialog}
                title="Regenerate Code"
                description={`Are you sure? The current code "${party.code}" will stop working. All members will need the new code to rejoin.`}
                confirmLabel={regenerateCodeMutation.isPending ? "Regenerating..." : "Regenerate"}
                loading={regenerateCodeMutation.isPending}
                onConfirm={handleRegenerate}
                onCancel={() => setShowRegenerateDialog(false)}
            />
        </Screen>
    );
}
