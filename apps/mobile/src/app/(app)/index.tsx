import { useDeleteUser, useGetUser } from "@/hooks/tan-stack/user";
import ConfirmDialog from "@/components/confirm-dialog";
import { LogOut, Trash2 } from "lucide-react-native";
import Screen from "@/components/ui/screen";
import Button from "@/components/ui/button";
import { Alert, View } from "react-native";
import { supabase } from "@/lib/supabase";
import Text from "@/components/ui/text";
import { router } from "expo-router";
import { useState } from "react";


export default function Home() {
    const userQuery = useGetUser();

    const deleteUserMutation = useDeleteUser();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.replace("/(auth)/sign-in");
    }

    function handleDeleteAccount() {
        deleteUserMutation.mutate(undefined, {
            onSuccess: async () => {
                setShowDeleteDialog(false);
                await supabase.auth.signOut();
                router.replace("/(auth)/sign-in");
            },
            onError: (err) => Alert.alert("Error", err.message),
        });
    }
    return (
        <Screen fullscreen className="py-16">
            <View className="flex-1">
                <Text className="font-bebas text-7xl">
                    {userQuery.data?.name}
                    <Text className="font-bebas text-3xl"> @{userQuery.data?.username}</Text>
                </Text>
                <Text className="font-bebas text-2xl">Experience: {userQuery.data?.experience} xp</Text>
                <Text className="font-bebas text-2xl">Current: {userQuery.data?.streak} days</Text>
                <Text className="font-bebas text-2xl">Longest: {userQuery.data?.longestStreak} days</Text>
                <Text className="font-bebas text-2xl">Visibility: {userQuery.data?.public ? "Public" : "Private"}</Text>
            </View>

            <View className="mb-auto gap-2">
                <Text className="font-jakarta-extrabold text-lg tracking-tight">Account</Text>

                <Button variant="destructive" asChild onPress={handleSignOut}>
                    <LogOut size={18} color="#fff" strokeWidth={2.5} />
                    <Text className="text-destructive-foreground font-jakarta-extrabold text-sm">Sign Out</Text>
                </Button>

                <Button variant="outline" asChild onPress={() => setShowDeleteDialog(true)}>
                    <Trash2 size={18} color="#DC2626" strokeWidth={2.5} />
                    <Text className="text-destructive font-jakarta-extrabold text-sm">Delete Account</Text>
                </Button>
            </View>

            <ConfirmDialog
                destructive
                title="Delete Account"
                visible={showDeleteDialog}
                confirmLabel="Delete My Account"
                onConfirm={handleDeleteAccount}
                loading={deleteUserMutation.isPending}
                onCancel={() => setShowDeleteDialog(false)}
                description="This action is irreversible. All your data, quests, parties, and progress will be permanently deleted. Are you absolutely sure?"
            />
        </Screen>
    );
}
