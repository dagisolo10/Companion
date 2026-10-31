import BackButton from "@/components/common/back-button";
import ErrorMessage from "@/components/common/error-message";
import Button from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { getRememberedAccounts, rememberAccount } from "@/lib/auth/remembered-accounts";
import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import { Platform, Pressable, Switch, View } from "react-native";

export default function AddAccountScreen() {
    const { email: initialEmail } = useLocalSearchParams<{ email?: string }>();

    const { applySession } = useAuth();

    const [password, setPassword] = useState("");
    const [email, setEmail] = useState(initialEmail ?? "");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberThisAccount, setRememberThisAccount] = useState(Platform.OS !== "web");

    const addAccountMutation = useMutation({
        mutationFn: async () => {
            if (Platform.OS !== "web") {
                const { data: current } = await supabase.auth.getSession();
                if (current.session && !getRememberedAccounts().some((account) => account.userId === current.session.user.id)) {
                    await rememberAccount(current.session).catch(() => undefined);
                }
            }

            const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
            if (error) throw error;
            if (!data.session) throw new Error("Supabase did not return an active session.");
            if (rememberThisAccount) await rememberAccount(data.session).catch(() => undefined);
            return data.session;
        },
        onSuccess: (session) => {
            applySession(session);
            router.back();
        },
    });

    return (
        <Screen fullscreen className="justify-center gap-6">
            <BackButton label="Add Account" />
            <View className="gap-1">
                <Text className="font-bebas text-5xl">Add an account</Text>
                <Text className="text-muted-foreground font-jakarta-medium text-base">Sign in here without signing out of your other accounts.</Text>
            </View>

            <View className="gap-4">
                <InputField icon={Mail} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" autoCapitalize="none" />
                <InputField
                    icon={Lock}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={!showPassword}
                    right={
                        <Pressable onPress={() => setShowPassword((shown) => !shown)} className="absolute top-1/2 right-4 -translate-y-1/2">
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </Pressable>
                    }
                />

                <View className="card flex-row items-center justify-between gap-4">
                    <View className="flex-1 gap-1">
                        <Text className="font-jakarta-bold text-sm">Remember this account</Text>
                        <Text className="text-muted-foreground text-xs">{Platform.OS === "web" ? "Secure account switching is available in the mobile app." : "Save its refresh token securely on this device."}</Text>
                    </View>
                    <Switch value={rememberThisAccount} onValueChange={setRememberThisAccount} disabled={addAccountMutation.isPending || Platform.OS === "web"} />
                </View>

                <ErrorMessage message={addAccountMutation.error?.message} />

                <Button onPress={() => addAccountMutation.mutate()} disabled={addAccountMutation.isPending || !email.trim() || !password} size="lg" right={ArrowRight}>
                    <Text className="font-bebas text-center text-3xl">{addAccountMutation.isPending ? "Signing In..." : "Add Account"}</Text>
                </Button>
            </View>
        </Screen>
    );
}
