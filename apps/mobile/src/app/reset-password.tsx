import Text from "@/components/ui/text";
import { useColor } from "@/hooks/use-color";
import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPassword() {
    const color = useColor();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleReset() {
        if (isSubmitting) return;

        setError(null);

        if (!password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { data } = await supabase.auth.getUser();

            const user = data.user;

            if (!user?.email) {
                throw new Error("User session not found.");
            }

            const { error: reAuthError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });

            if (reAuthError) {
                throw new Error("Current password is incorrect.");
            }

            const { error: updateError } = await supabase.auth.updateUser({ password });

            if (updateError) throw updateError;

            router.replace("/");
        } catch (err) {
            if (err instanceof Error) setError(err.message || "Failed to reset password.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <SafeAreaView className="flex-1" style={{ flex: 1, backgroundColor: color.background }}>
            <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flex: 1 }}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="bg-background flex-1 px-6">
                    <View className="bg-background flex-1 justify-center gap-6">
                        <View className="gap-2">
                            <Text className="text-foreground text-3xl font-bold">Reset Password</Text>
                            <Text className="text-muted-foreground text-base">Enter your new password below to secure your account.</Text>
                        </View>

                        <View className="gap-4">
                            <View className="gap-1.5">
                                <Text className="text-foreground text-sm font-semibold">Current Password</Text>
                                <View className="relative justify-center">
                                    <TextInput
                                        className="border-border bg-card text-foreground h-12 w-full rounded-xl border px-4 pr-16"
                                        autoCorrect={false}
                                        autoCapitalize="none"
                                        placeholder="••••••••"
                                        value={currentPassword}
                                        placeholderTextColor="#a3a3a3"
                                        secureTextEntry={!showPassword}
                                        onChangeText={setCurrentPassword}
                                    />
                                    <Pressable onPress={() => setShowPassword(!showPassword)} className="absolute right-4 py-2">
                                        <Text className="text-primary text-xs font-semibold">{showPassword ? "Hide" : "Show"}</Text>
                                    </Pressable>
                                </View>
                            </View>

                            <View className="gap-1.5">
                                <Text className="text-foreground text-sm font-semibold">New Password</Text>
                                <View className="relative justify-center">
                                    <TextInput
                                        className="border-border bg-card text-foreground h-12 w-full rounded-xl border px-4 pr-16"
                                        value={password}
                                        autoCorrect={false}
                                        autoCapitalize="none"
                                        placeholder="••••••••"
                                        onChangeText={setPassword}
                                        placeholderTextColor="#a3a3a3"
                                        secureTextEntry={!showPassword}
                                    />
                                </View>
                            </View>

                            <View className="gap-1.5">
                                <Text className="text-foreground text-sm font-semibold">Confirm New Password</Text>
                                <TextInput
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    placeholderTextColor="#a3a3a3"
                                    secureTextEntry={!showPassword}
                                    onChangeText={setConfirmPassword}
                                    className="border-border bg-card text-foreground h-12 w-full rounded-xl border px-4"
                                />
                            </View>

                            {error ? <Text className="text-destructive text-sm font-semibold">{error}</Text> : null}

                            <Pressable onPress={handleReset} disabled={isSubmitting} className="mt-2 h-12 flex-row items-center justify-center gap-2 rounded-xl bg-blue-400 active:opacity-90 disabled:opacity-50">
                                {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text className="text-base font-semibold text-white">Update Password</Text>}
                            </Pressable>

                            <View className="mt-4 flex-row justify-center">
                                <Link href="/(auth)/sign-in" asChild>
                                    <Pressable>
                                        <Text className="text-muted-foreground text-sm">
                                            Remember your password? <Text className="text-primary font-semibold">Sign In</Text>
                                        </Text>
                                    </Pressable>
                                </Link>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
}
