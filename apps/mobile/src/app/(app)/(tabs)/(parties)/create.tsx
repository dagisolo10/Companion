import BackButton from "@/components/back-button";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useCreateParty } from "@/hooks/tan-stack/party";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function CreatePartyScreen() {
    const [name, setName] = useState("");
    const { mutate: createParty, isPending } = useCreateParty({
        onSuccess: (party) => {
            router.replace(`/(app)/(parties)/${party.code}`);
        },
    });

    function handleCreate() {
        const trimmed = name.trim();
        if (!trimmed) return;
        createParty({ name: trimmed });
    }

    return (
        <Screen nonScrollable className="gap-5">
            <View className="flex-row items-center gap-3">
                <BackButton />
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">Create Party</Text>
            </View>

            <View>
                <View className="gap-5">
                    <View className="gap-2">
                        <Text className="font-jakarta-bold text-sm">Party Name</Text>
                        <Input value={name} returnKeyType="done" autoCapitalize="words" onChangeText={setName} placeholder="e.g. Night Owls" onSubmitEditing={handleCreate} />
                    </View>

                    <Button onPress={handleCreate} disabled={isPending || !name.trim()}>
                        {isPending ? "Creating..." : "Create Party"}
                    </Button>
                </View>
            </View>
        </Screen>
    );
}
