import { useCreateParty } from "@/hooks/tan-stack/party";
import BackButton from "@/components/common/back-button";
import useToast from "@/hooks/custom/use-toast";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { router } from "expo-router";
import { View } from "react-native";
import { useState } from "react";

export default function CreatePartyScreen() {
    const [name, setName] = useState("");
    const { showToast } = useToast();
    const createPartyMutation = useCreateParty({
        onSuccess: (party) => {
            router.replace(`/(app)/(tabs)/(party)/${party.code}`);
        },
        onError: (error) => showToast({ title: "Could not create party", description: error.message || "Please try again.", variant: "error" }),
    });

    function handleCreate() {
        const trimmed = name.trim();
        if (!trimmed) return;
        createPartyMutation.mutate({ name: trimmed });
    }

    return (
        <Screen fullscreen className="gap-5">
            <BackButton label="Create Party" />

            <View>
                <View className="gap-5">
                    <View className="gap-2">
                        <Text className="text-sm font-bold">Party Name</Text>
                        <Input value={name} returnKeyType="done" autoCapitalize="words" onChangeText={setName} placeholder="e.g. Night Owls" onSubmitEditing={handleCreate} />
                    </View>

                    <Button size={"lg"} onPress={handleCreate} disabled={createPartyMutation.isPending || !name.trim()}>
                        <Text>{createPartyMutation.isPending ? "Creating..." : "Create Party"}</Text>
                    </Button>
                </View>
            </View>
        </Screen>
    );
}
