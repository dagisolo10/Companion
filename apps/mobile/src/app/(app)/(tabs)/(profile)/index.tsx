import ConfirmDialog from "@/components/confirm-dialog";
import LevelCard from "@/components/level-card";
import StreakCard from "@/components/streak-card";
import Button from "@/components/ui/button";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { useDeleteUser, useGetUser } from "@/hooks/tan-stack/user";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { CheckCircle2, Flame, LogOut, Moon, Sparkles, Sun, Trash2, Trophy, User } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, Appearance, Pressable, View, useColorScheme } from "react-native";

export default function Profile() {
    const color = useColor();
    const scheme = useColorScheme();

    const { data: user, error, isFetching: userLoading } = useGetUser();
    const { mutate: deleteUser, isPending: deleting } = useDeleteUser();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.replace("/(auth)/sign-in");
    }

    function handleDeleteAccount() {
        deleteUser(undefined, {
            onSuccess: async () => {
                setShowDeleteDialog(false);
                await supabase.auth.signOut();
                router.replace("/(auth)/sign-in");
            },
            onError: (err) => Alert.alert("Error", err.message),
        });
    }

    if (userLoading) {
        return (
            <Screen className="items-center justify-center" fullscreen>
                <ActivityIndicator color={"white"} size={"large"} />
            </Screen>
        );
    }

    if (error || !user) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <Text className="text-destructive text-sm">{error?.message || "User not found"}</Text>
            </Screen>
        );
    }

    const initial = user.name.charAt(0).toUpperCase();

    return (
        <Screen className="gap-5">
            <View className="items-center gap-3">
                <View className="border-foreground bg-amber shadow-nb h-20 w-20 items-center justify-center rounded-full border-2">
                    <Text className="font-jakarta-extrabold text-3xl text-black">{initial}</Text>
                </View>
                <View className="items-center gap-0.5">
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">{user.name}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-sm">@{user.username}</Text>
                </View>
            </View>

            <LevelCard loading={userLoading} experience={user.experience} />
            <StreakCard loading={userLoading} streak={user.streak} longestStreak={user.longestStreak} />

            <View className="flex-row flex-wrap gap-3">
                <View className="card flex-1 items-center gap-1.5">
                    <Flame size={20} color="#DC2626" fill="#DC2626" strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">{user.streak}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-xs">Current Streak</Text>
                </View>
                <View className="card flex-1 items-center gap-1.5">
                    <Trophy size={20} color="#f59e0b" strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">{user.longestStreak}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-xs">Best Streak</Text>
                </View>
                <View className="card flex-1 items-center gap-1.5">
                    <Sparkles size={20} color="#7c3aed" strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">{user.experience}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-xs">Total XP</Text>
                </View>
            </View>

            <View className="card flex-row items-center gap-2.5">
                <CheckCircle2 size={18} color="#65a30d" strokeWidth={2.5} />
                <Text className="text-muted-foreground font-jakarta-bold text-xs">Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</Text>
            </View>

            <View className="gap-2">
                <Text className="font-jakarta-extrabold text-lg tracking-tight">Settings</Text>

                <View className="border-foreground bg-card shadow-nb-sm rounded-2xl border-2">
                    <Pressable onPress={() => Appearance.setColorScheme(scheme === "dark" ? "light" : "dark")} className="border-border flex-row items-center justify-between rounded-b-none border-b-2 px-4 py-3">
                        <View className="flex-row items-center gap-3">
                            {scheme === "dark" ? <Moon size={18} color={color.mutedForeground} strokeWidth={2.5} /> : <Sun size={18} color={color.mutedForeground} strokeWidth={2.5} />}
                            <Text className="font-jakarta-bold text-sm">{scheme === "dark" ? "Dark Mode" : "Light Mode"}</Text>
                        </View>
                        <View className={`bg-foreground h-6 w-11 rounded-full p-0.5 ${scheme === "dark" ? "justify-end" : "justify-start"}`}>
                            <View className="bg-background h-5 w-5 rounded-full" />
                        </View>
                    </Pressable>

                    <Button variant="ghost" asChild onPress={() => router.push("/(app)/(profile)/edit")} className="flex-row items-center justify-between px-4">
                        <View className="flex-row items-center gap-3">
                            <User size={18} color={color.mutedForeground} strokeWidth={2.5} />
                            <Text className="font-jakarta-bold text-sm">Edit Profile</Text>
                        </View>
                    </Button>
                </View>
            </View>

            <View className="mb-4 gap-2">
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
                visible={showDeleteDialog}
                title="Delete Account"
                description="This action is irreversible. All your data, quests, parties, and progress will be permanently deleted. Are you absolutely sure?"
                confirmLabel="Delete My Account"
                destructive
                loading={deleting}
                onConfirm={handleDeleteAccount}
                onCancel={() => setShowDeleteDialog(false)}
            />
        </Screen>
    );
}
