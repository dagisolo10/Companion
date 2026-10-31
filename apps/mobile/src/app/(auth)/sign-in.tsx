import ErrorMessage from "@/components/common/error-message";
import Button from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useColor } from "@/hooks/custom/use-color";
import { getRememberedAccounts, rememberAccount, RememberedAccount, restoreRememberedAccount } from "@/lib/auth/remembered-accounts";
import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import { Link, router, useFocusEffect } from "expo-router";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Platform, Pressable, Switch, View } from "react-native";
import { z } from "zod";

const signInSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignIn() {
    const color = useColor();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberThisAccount, setRememberThisAccount] = useState(false);
    const [savedAccounts, setSavedAccounts] = useState<RememberedAccount[]>([]);
    const { applySession } = useAuth();

    const refreshSavedAccounts = useCallback(() => setSavedAccounts(getRememberedAccounts()), []);
    useFocusEffect(refreshSavedAccounts);

    const restoreAccountMutation = useMutation({
        mutationFn: (account: RememberedAccount) => restoreRememberedAccount(account.userId),
        onSuccess: (session) => {
            applySession(session);
            router.replace("/(app)/(home)");
        },
    });

    const signInWithPasswordMt = useMutation({
        mutationFn: async () => {
            const parsed = signInSchema.parse({ email, password });

            const { data, error } = await supabase.auth.signInWithPassword({ ...parsed });

            if (error) {
                throw error;
            }

            if (rememberThisAccount && data.session) await rememberAccount(data.session).catch(() => undefined);
        },
        onSuccess: () => {
            router.replace("/(app)/(home)");
        },
    });

    return (
        <Screen fullscreen className="justify-center gap-8">
            <View className="max-w-86 items-start">
                <Text className="font-bebas text-6xl">Welcome Back</Text>
                <Text className="text-muted-foreground font-jakarta-medium text-xl">Sign in to your account to continue</Text>
            </View>

            {savedAccounts.length > 0 && (
                <View className="gap-2">
                    <Text className="font-jakarta-extrabold text-sm">Continue as</Text>
                    {savedAccounts.map((account) => {
                        const isRestoring = restoreAccountMutation.isPending && restoreAccountMutation.variables?.userId === account.userId;
                        return (
                            <Pressable
                                key={account.userId}
                                accessibilityRole="button"
                                accessibilityLabel={`Continue as ${account.name}, ${account.email}`}
                                disabled={restoreAccountMutation.isPending || signInWithPasswordMt.isPending}
                                onPress={() => {
                                    setEmail(account.email);
                                    setRememberThisAccount(true);
                                    restoreAccountMutation.reset();
                                    restoreAccountMutation.mutate(account);
                                }}
                                className="card flex-row items-center gap-3 px-4 py-3 active:opacity-80"
                            >
                                <View className="bg-lime border-foreground h-10 w-10 items-center justify-center border-2">
                                    <Text className="font-jakarta-extrabold text-black">{account.name.slice(0, 1).toUpperCase()}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="font-jakarta-extrabold text-sm" numberOfLines={1}>
                                        {account.name}
                                    </Text>
                                    <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                                        {account.email}
                                    </Text>
                                </View>
                                {isRestoring ? <ActivityIndicator color={color.foreground} /> : <ArrowRight size={18} color={color.foreground} />}
                            </Pressable>
                        );
                    })}
                    <ErrorMessage message={restoreAccountMutation.error ? `${restoreAccountMutation.error instanceof Error ? restoreAccountMutation.error.message : "Could not restore this account."} Enter your password below to sign in again.` : undefined} />
                </View>
            )}

            <View className="gap-5">
                <InputField icon={Mail} value={email} autoComplete="email" autoCapitalize="none" onChangeText={setEmail} placeholder="bob@gmail.com" keyboardType="email-address" />

                <View className="gap-1.5">
                    <Link className="self-end" href="/forgot-password" asChild>
                        <Pressable>
                            <Text>Forgot Password?</Text>
                        </Pressable>
                    </Link>

                    <InputField
                        icon={Lock}
                        right={
                            <Pressable onPress={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2">
                                {showPassword ? <EyeOff size={20} color={color.mutedForeground} /> : <Eye size={20} color={color.mutedForeground} />}
                            </Pressable>
                        }
                        autoCorrect={false}
                        value={password}
                        autoCapitalize="none"
                        placeholder="••••••••"
                        secureTextEntry={!showPassword}
                        onChangeText={setPassword}
                    />
                </View>

                <View className="card flex-row items-center justify-between gap-4">
                    <View className="flex-1 gap-1">
                        <Text className="font-jakarta-bold text-sm">Remember this account</Text>
                        <Text className="text-muted-foreground text-xs">{Platform.OS === "web" ? "Secure account switching is available in the mobile app." : "Save it securely on this device for account switching."}</Text>
                    </View>
                    <Switch value={rememberThisAccount} onValueChange={setRememberThisAccount} disabled={signInWithPasswordMt.isPending || Platform.OS === "web"} />
                </View>

                <ErrorMessage message={signInWithPasswordMt.error?.message} />

                <Button onPress={() => signInWithPasswordMt.mutateAsync()} disabled={signInWithPasswordMt.isPending} size={"lg"} className="mt-1" right={ArrowRight}>
                    <Text className="font-bebas text-center text-3xl">{signInWithPasswordMt.isPending ? "Signing In..." : "Sign In"}</Text>
                </Button>

                <View className="mt-2 flex-row justify-center">
                    <Link href="/(auth)/sign-up" asChild>
                        <Pressable>
                            <Text className="text-muted-foreground font-jakarta-medium text-lg">
                                Don&apos;t have an account? <Text className="font-jakarta-bold underline">Sign Up</Text>
                            </Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </Screen>
    );
}
