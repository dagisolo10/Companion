import SectionHeader from "@/components/common/section-header";
import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useColor } from "@/hooks/custom/use-color";
import useConfirmDialog from "@/hooks/custom/use-confirm-dialog";
import useToast from "@/hooks/custom/use-toast";
import { forgetAccount, getRememberedAccounts, RememberedAccount, restoreRememberedAccount } from "@/lib/auth/remembered-accounts";
import { useMutation } from "@tanstack/react-query";
import { cn } from "cn";
import { router, useFocusEffect } from "expo-router";
import { Check, ChevronDown, LogIn, Trash2, UserPlus, UsersRound } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import Animated, { createAnimatedComponent, Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedChevron = createAnimatedComponent(ChevronDown);

export default function AccountSwitcher({ currentUserId, onExpand }: { currentUserId: string; onExpand?: () => void }) {
    const [accounts, setAccounts] = useState<RememberedAccount[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const color = useColor();
    const { applySession } = useAuth();
    const { showConfirmDialog, confirmDialog } = useConfirmDialog();
    const { showToast } = useToast();

    const rotation = useSharedValue(0);
    const progress = useSharedValue(0);
    const menuHeight = useSharedValue(0);

    const refreshAccounts = useCallback(() => setAccounts(getRememberedAccounts()), []);

    useFocusEffect(
        useCallback(() => {
            refreshAccounts();
        }, [refreshAccounts]),
    );

    useEffect(() => {
        rotation.value = withTiming(showDropdown ? 180 : 0, { duration: 250, easing: Easing.bezier(0.25, 1, 0.5, 1) });
        progress.value = withTiming(showDropdown ? 1 : 0, { duration: 250, easing: Easing.bezier(0.25, 1, 0.5, 1) });
    }, [progress, rotation, showDropdown]);

    useEffect(() => {
        if (!showDropdown) return;

        const timeout = setTimeout(() => onExpand?.(), 50);

        return () => clearTimeout(timeout);
    }, [onExpand, showDropdown]);

    const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
    const dynamicDropdownStyle = useAnimatedStyle(() => ({ opacity: progress.value, height: progress.value * menuHeight.value }));

    const currentAccount = accounts.find((acc) => acc.userId === currentUserId);

    const switchAccountMutation = useMutation({
        mutationFn: (account: RememberedAccount) => restoreRememberedAccount(account.userId),
        onSuccess: (session) => {
            applySession(session);
            refreshAccounts();
            setShowDropdown(false);
        },
        onError: (error, account) => {
            showConfirmDialog({
                title: "Could not switch accounts",
                description: `${error instanceof Error ? error.message : "The saved session is no longer valid."} Sign in again to refresh this account on this device.`,
                confirmLabel: "Sign in",
                onConfirm: () => router.push({ pathname: "/(app)/(tabs)/(profile)/add-account", params: { email: account.email } }),
            });
        },
    });

    const forgetAccountMutation = useMutation({
        mutationFn: (account: RememberedAccount) => forgetAccount(account.userId),
        onSuccess: () => {
            refreshAccounts();
            if (accounts.length <= 1) setShowDropdown(false);
            showToast({ title: "Account forgotten", description: "It has been removed from this device.", variant: "success" });
        },
        onError: (error) => showToast({ title: "Could not forget account", description: error instanceof Error ? error.message : "Please try again.", variant: "error" }),
    });

    function handleForget(account: RememberedAccount) {
        showConfirmDialog({
            title: "Forget account",
            description: `Remove ${account.email} from this device? This will not delete the account or sign it out on other devices.`,
            confirmLabel: "Forget account",
            destructive: true,
            onConfirm: () => forgetAccountMutation.mutate(account),
        });
    }

    if (accounts.length === 0) {
        return (
            <View className="gap-2">
                {confirmDialog}
                <SectionHeader title="Account" />
                <View className="card items-center gap-3 py-6">
                    <View className="border-foreground bg-amber border-2 p-2">
                        <UsersRound size={18} color="#000" strokeWidth={2.5} />
                    </View>
                    <View className="items-center gap-0.5">
                        <Text className="font-jakarta-bold text-sm">No saved accounts</Text>
                        <Text className="text-muted-foreground font-jakarta-bold text-center text-xs">Choose &quot;Remember this account&quot; when signing in to switch easily.</Text>
                    </View>
                    <Button size="sm" onPress={() => router.push("/(app)/(tabs)/(profile)/add-account")}>
                        <UserPlus size={14} color="#000" strokeWidth={2.5} />
                        <Text className="font-jakarta-bold text-xs">Add Account</Text>
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View className="z-20 gap-2">
            {confirmDialog}
            <SectionHeader title="Switch Account" />

            <Pressable onPress={() => setShowDropdown((prev) => !prev)} className="card flex-row items-center justify-between px-4 py-3 active:opacity-90">
                <View className="flex-1 flex-row items-center gap-3">
                    <View className="bg-lime border-foreground h-9 w-9 items-center justify-center border-2">
                        <Text className="font-jakarta-extrabold text-black">{currentAccount ? currentAccount.name.slice(0, 1).toUpperCase() : "?"}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="font-jakarta-extrabold text-sm" numberOfLines={1}>
                            {currentAccount ? currentAccount.name : "Select an account"}
                        </Text>
                        <Text className="text-muted-foreground font-jakarta-bold text-xs" numberOfLines={1}>
                            {currentAccount ? currentAccount.email : "Tap to expand accounts"}
                        </Text>
                    </View>
                </View>
                <AnimatedChevron size={18} color={color.foreground} strokeWidth={2.5} style={chevronStyle} />
            </Pressable>

            <Animated.View style={[dynamicDropdownStyle]} className="overflow-hidden">
                <View onLayout={(e) => (menuHeight.value = e.nativeEvent.layout.height + 8)} className="card bg-background border-foreground shadow-nb mt-1.5 gap-1 border-2 p-2">
                    {accounts.map((account, index) => {
                        const isCurrent = account.userId === currentUserId;
                        const isSwitching = switchAccountMutation.isPending && switchAccountMutation.variables?.userId === account.userId;
                        const isLast = index === accounts.length - 1;

                        return (
                            <View key={account.userId} className={cn("flex-row items-center justify-between px-3 py-2.5", !isLast && "border-border border-b", isCurrent ? "bg-amber" : "active:bg-muted")}>
                                <Pressable onPress={() => switchAccountMutation.mutate(account)} disabled={isCurrent || switchAccountMutation.isPending || forgetAccountMutation.isPending} className="mr-2 flex-1 flex-row items-center gap-3">
                                    <View className="bg-lime border-foreground h-8 w-8 items-center justify-center border-2">
                                        <Text className="font-jakarta-extrabold text-xs text-black">{account.name.slice(0, 1).toUpperCase()}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className={cn("font-jakarta-extrabold", isCurrent ? "text-black" : "text-foreground")} numberOfLines={1}>
                                            {account.name}
                                        </Text>
                                        <Text className={cn("font-jakarta-bold text-xs", isCurrent ? "text-black/70" : "text-muted-foreground")} numberOfLines={1}>
                                            {account.email}
                                        </Text>
                                    </View>
                                </Pressable>

                                <View className="flex-row items-center gap-1">
                                    {isCurrent ? (
                                        <Check size={18} color="#000" strokeWidth={3} />
                                    ) : (
                                        <Button size="sm" variant="outline" onPress={() => switchAccountMutation.mutate(account)} disabled={switchAccountMutation.isPending || forgetAccountMutation.isPending}>
                                            {isSwitching ? <ActivityIndicator size="small" color={color.foreground} /> : <LogIn size={14} color={color.foreground} strokeWidth={2.5} />}
                                        </Button>
                                    )}

                                    <Button size="icon" variant="ghost" onPress={() => handleForget(account)} disabled={switchAccountMutation.isPending || forgetAccountMutation.isPending} accessibilityLabel={`Forget ${account.email}`}>
                                        <Trash2 size={16} color={isCurrent ? "#000" : color.mutedForeground} strokeWidth={2.5} />
                                    </Button>
                                </View>
                            </View>
                        );
                    })}
                    <Button variant="outline" onPress={() => router.push("/(app)/(tabs)/(profile)/add-account")} className="mt-2">
                        <UserPlus size={14} color="#000" strokeWidth={2.5} />
                        <Text className="font-jakarta-bold">Add Account</Text>
                    </Button>
                </View>
            </Animated.View>
        </View>
    );
}
