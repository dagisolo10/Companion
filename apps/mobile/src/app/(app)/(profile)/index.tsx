import ConfirmDialog from "@/components/confirm-dialog";
import LevelCard from "@/components/level-card";
import StreakCard from "@/components/streak-card";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { useDeleteUser, useGetUser } from "@/hooks/tan-stack/user";
import { supabase } from "@/lib/supabase";
import { formatDateTime } from "@/utils/formatters";
import { cn } from "cn";
import { router } from "expo-router";
import { CheckCircle2, ChevronRight, Flame, Globe, Lock, LogOut, LucideIcon, Moon, Sparkles, Sun, Trash2, Trophy, User } from "lucide-react-native";
import { PropsWithChildren, ReactNode, useState } from "react";
import { ActivityIndicator, Alert, Appearance, Pressable, Switch, View, useColorScheme } from "react-native";

export default function Profile() {
    const color = useColor();
    const scheme = useColorScheme();

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

    if (userQuery.isFetching) {
        return (
            <Screen className="items-center justify-center" fullscreen>
                <ActivityIndicator color={"white"} size={"large"} />
            </Screen>
        );
    }

    if (userQuery.error || !userQuery.data) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <Text className="text-destructive text-sm">{userQuery.error?.message || "User not found"}</Text>
            </Screen>
        );
    }

    const initial = userQuery.data.name.charAt(0).toUpperCase();
    const isPublic = userQuery.data.public;

    return (
        <Screen className="gap-5">
            <View className="items-center gap-3">
                <View className="border-foreground bg-amber shadow-nb h-20 w-20 items-center justify-center rounded-full border-2">
                    <Text className="font-jakarta-extrabold text-3xl text-black">{initial}</Text>
                </View>
                <View className="items-center gap-0.5">
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">{userQuery.data.name}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-sm">@{userQuery.data.username}</Text>
                </View>
            </View>

            <StreakCard loading={userQuery.isFetching} streak={userQuery.data.streak} longestStreak={userQuery.data.longestStreak} />
            <LevelCard loading={userQuery.isFetching} experience={userQuery.data.experience} />

            <View className="card flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                    {isPublic ? <Globe size={18} color="#22C55E" strokeWidth={2.5} /> : <Lock size={18} color={color.mutedForeground} strokeWidth={2.5} />}
                    <View>
                        <Text className="font-jakarta-bold text-xs">{isPublic ? "Public Profile" : "Private Profile"}</Text>
                        <Text className="text-muted-foreground font-jakarta-medium text-[11px]">{isPublic ? "Visible in search & leaderboards" : "Hidden from search & public view"}</Text>
                    </View>
                </View>

                <View className={cn("border-foreground rounded-full border-2 px-2 py-0.5", isPublic ? "bg-lime" : "bg-muted")}>
                    <Text className="font-jakarta-extrabold text-[10px] text-black uppercase">{isPublic ? "Public" : "Private"}</Text>
                </View>
            </View>

            <View className="flex-row flex-wrap gap-3">
                <View className="card flex-1 items-center gap-1.5">
                    <Flame size={20} color="#DC2626" fill="#DC2626" strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">{userQuery.data.streak}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-xs">Current Streak</Text>
                </View>
                <View className="card flex-1 items-center gap-1.5">
                    <Trophy size={20} color="#f59e0b" strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">{userQuery.data.longestStreak}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-xs">Best Streak</Text>
                </View>
                <View className="card flex-1 items-center gap-1.5">
                    <Sparkles size={20} color="#7c3aed" strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">{userQuery.data.experience}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-xs">Total XP</Text>
                </View>
            </View>

            <View className="card flex-row items-center gap-2.5">
                <CheckCircle2 size={18} color="#65a30d" strokeWidth={2.5} />
                <Text className="text-muted-foreground font-jakarta-bold text-xs">Joined {formatDateTime(userQuery.data.createdAt)}</Text>
            </View>

            <SettingGroup label="Settings">
                <SettingRow icon={scheme === "dark" ? Moon : Sun} label={scheme === "dark" ? "Dark Mode" : "Light Mode"} rightSide={<Switch value={scheme === "dark"} onValueChange={() => Appearance.setColorScheme(scheme === "dark" ? "light" : "dark")} />} />
                <SettingRow icon={User} label="Edit Profile" onPress={() => router.push("/(app)/(profile)/edit")} isLast />
            </SettingGroup>

            <SettingGroup label="Account">
                <SettingRow label="Sign Out" icon={LogOut} onPress={handleSignOut} />
                <SettingRow label="Delete Account" icon={Trash2} onPress={() => setShowDeleteDialog(true)} isLast />
            </SettingGroup>

            {/* <View className="mb-4 gap-2">
                <Text className="font-jakarta-extrabold text-lg tracking-tight">Account</Text>

                <Button variant="destructive" onPress={handleSignOut} asChild>
                    <LogOut color="#fff" size={18} strokeWidth={2.5} />
                    <Text className="text-destructive-foreground font-jakarta-extrabold text-sm">Sign Out</Text>
                </Button>

                <Button variant="outline" onPress={() => setShowDeleteDialog(true)} asChild>
                    <Trash2 color="#DC2626" size={18} strokeWidth={2.5} />
                    <Text className="text-destructive font-jakarta-extrabold text-sm">Delete Account</Text>
                </Button>
            </View> */}

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

interface SettingRowProps {
    label: string;
    icon: LucideIcon;
    isLast?: boolean;
    onPress?: () => void;
    rightSide?: ReactNode;
}

function SettingGroup({ label, children }: PropsWithChildren & { label: string }) {
    return (
        <View className="gap-2">
            <Text className="font-jakarta-extrabold text-lg tracking-tight">{label}</Text>
            <View className="border-foreground bg-card shadow-nb border-2">{children}</View>
        </View>
    );
}

function SettingRow({ icon: Icon, label, onPress, rightSide, isLast }: SettingRowProps) {
    const color = useColor();

    const content = (
        <View className={cn(!isLast ? "border-border border-b-2" : "", "h-14 flex-row items-center justify-between px-4")}>
            <View className="flex-row items-center gap-3">
                <Icon size={18} color={color.mutedForeground} strokeWidth={2.5} />
                <Text className={cn("font-medium")}>{label}</Text>
            </View>

            <View className="justify-center">{rightSide ? rightSide : <ChevronRight size={18} color={color.mutedForeground} strokeWidth={2.5} />}</View>
        </View>
    );

    if (onPress) {
        return (
            <Pressable onPress={onPress} className="active:opacity-70">
                {content}
            </Pressable>
        );
    }

    return content;
}
