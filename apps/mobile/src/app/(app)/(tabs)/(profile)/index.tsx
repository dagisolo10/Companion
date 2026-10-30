import AccountSwitcher from "@/components/account/account-switcher";
import ConfirmDialog from "@/components/common/confirm-dialog";
import ProfileView, { SkeletonProfileView } from "@/components/profile/profile";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useColor } from "@/hooks/custom/use-color";
import useToast from "@/hooks/custom/use-toast";
import { useDeleteUser, useGetUser } from "@/hooks/tan-stack/user";
import { forgetAccount } from "@/lib/auth/remembered-accounts";
import { supabase } from "@/lib/supabase";
import { cn } from "cn";
import { router } from "expo-router";
import { ChevronRight, KeyRound, LogOut, LucideIcon, Moon, Sun, Trash2, User } from "lucide-react-native";
import { PropsWithChildren, ReactNode, useCallback, useRef, useState } from "react";
import type { ScrollViewInstance } from "react-native";
import { Appearance, Pressable, Switch, View, useColorScheme } from "react-native";

export default function Profile() {
    const { user } = useAuth();

    return <ProfileContent key={user?.id ?? "signed-out"} />;
}

function ProfileContent() {
    const scheme = useColorScheme();

    const userQuery = useGetUser();
    const deleteUserMutation = useDeleteUser();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { showToast } = useToast();

    const scrollViewRef = useRef<ScrollViewInstance>(null);
    const handleSwitcherExpand = useCallback(() => scrollViewRef.current?.scrollToEnd({ animated: true }), []);

    async function handleSignOut() {
        const currentUserId = userQuery.data?.id;
        const { error } = await supabase.auth.signOut({ scope: "local" });

        if (error) {
            showToast({ title: "Could not sign out", description: "Please try again.", variant: "error" });
            return;
        }

        if (currentUserId) await forgetAccount(currentUserId).catch(() => undefined);
        router.replace("/(auth)/sign-in");
    }

    function handleDeleteAccount() {
        deleteUserMutation.mutate(undefined, {
            onSuccess: async () => {
                const { error } = await supabase.auth.signOut({ scope: "local" });

                if (error) {
                    throw error;
                }

                if (userQuery.data?.id) await forgetAccount(userQuery.data.id).catch(() => undefined);
                setShowDeleteDialog(false);
                router.replace("/(auth)/sign-in");
            },
            onError: (err) => {
                setShowDeleteDialog(false);
                showToast({ title: "Could not delete account", description: err.message || "Please try again.", variant: "error" });
            },
        });
    }

    if (userQuery.isPending) {
        return <SkeletonProfileView />;
    }

    if (userQuery.error || !userQuery.data) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <Text className="text-destructive text-sm">{userQuery.error?.message || "User not found"}</Text>
            </Screen>
        );
    }

    return (
        <Screen className="gap-5" scrollRef={scrollViewRef}>
            <ProfileView user={userQuery.data} visibility />

            <SettingGroup label="Settings">
                <SettingRow icon={scheme === "dark" ? Moon : Sun} label={scheme === "dark" ? "Dark Mode" : "Light Mode"} rightSide={<Switch value={scheme === "dark"} onValueChange={() => Appearance.setColorScheme(scheme === "dark" ? "light" : "dark")} />} />
                <SettingRow icon={User} label="Edit Profile" onPress={() => router.push("/(app)/(tabs)/(profile)/edit")} isLast />
            </SettingGroup>

            <SettingGroup label="Account">
                <SettingRow label="Change Password" icon={KeyRound} onPress={() => router.push("/(app)/(tabs)/(profile)/change-password")} />
                <SettingRow label="Sign Out" icon={LogOut} onPress={handleSignOut} />
                <SettingRow label="Delete Account" icon={Trash2} onPress={() => setShowDeleteDialog(true)} isLast />
            </SettingGroup>

            <AccountSwitcher currentUserId={userQuery.data.id} onExpand={handleSwitcherExpand} />

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
            <Text className="text-lg font-extrabold tracking-tight">{label}</Text>
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
