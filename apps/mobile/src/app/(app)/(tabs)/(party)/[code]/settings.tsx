import { useGetParty, useRegeneratePartyCode, useUpdateParty } from "@/hooks/tan-stack/party";
import useToast from "@/hooks/custom/use-toast";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { router, useLocalSearchParams } from "expo-router";
import BackButton from "@/components/common/back-button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { RefreshCw, Save } from "lucide-react-native";
import { Party } from "@companion/shared-types";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Button from "@/components/ui/button";
import { Switch, View } from "react-native";
import Text from "@/components/ui/text";
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
    const [isPublic, setIsPublic] = useState(party.public);
    const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
    const { showToast } = useToast();

    function handleSave() {
        if (!name.trim()) {
            showToast({ title: "Party name required", description: "Enter a name before saving.", variant: "warning" });
            return;
        }
        updatePartyMutation.mutate(
            { id: party.id, data: { name: name.trim(), public: isPublic } },
            {
                onSuccess: () => router.back(),
                onError: (err) => showToast({ title: "Could not save party", description: err.message, variant: "error" }),
            },
        );
    }

    function handleRegenerate() {
        regenerateCodeMutation.mutate(party.id, {
            onSuccess: ({ code }) => {
                setShowRegenerateDialog(false);
                router.push({ pathname: "/(app)/(tabs)/(party)/[code]", params: { code } });
            },
            onError: (err) => showToast({ title: "Could not regenerate code", description: err.message, variant: "error" }),
        });
    }

    return (
        <Screen className="gap-5">
            <BackButton label="Settings" />

            <View className="gap-1.5">
                <Text className="text-sm">Party Name</Text>
                <Input placeholder="Party name" value={name} onChangeText={setName} />
            </View>

            <View className="card flex-row items-center justify-between gap-4">
                <View className="flex-1 gap-1">
                    <Text className="text-sm font-bold">Public party</Text>
                    <Text className="text-muted-foreground text-xs">{isPublic ? "Anyone can find this party in Discover." : "This party is hidden from Discover and can only be found by its code."}</Text>
                </View>
                <Switch value={isPublic} onValueChange={setIsPublic} disabled={updatePartyMutation.isPending} />
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
