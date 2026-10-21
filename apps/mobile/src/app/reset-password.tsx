import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

export default function ResetPassword() {
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

            router.replace("/(app)");
        } catch (err) {
            if (err instanceof Error) setError(err.message || "Failed to reset password.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Screen fullscreen className="justify-center gap-8">
            <View className="gap-2">
                <Text className="font-jakarta-extrabold text-3xl tracking-tight">Reset Password</Text>
                <Text className="text-muted-foreground font-jakarta-medium text-sm">Enter your new password below to secure your account.</Text>
            </View>

            <View className="gap-5">
                <View className="gap-1.5">
                    <Text className="font-jakarta-bold text-sm">Current Password</Text>
                    <View className="relative justify-center">
                        <Input className="pr-16" autoCorrect={false} autoCapitalize="none" placeholder="••••••••" value={currentPassword} secureTextEntry={!showPassword} onChangeText={setCurrentPassword} />
                        <Pressable onPress={() => setShowPassword(!showPassword)} className="absolute right-4 py-2">
                            <Text className="font-jakarta-bold text-xs text-amber">{showPassword ? "Hide" : "Show"}</Text>
                        </Pressable>
                    </View>
                </View>

                <View className="gap-1.5">
                    <Text className="font-jakarta-bold text-sm">New Password</Text>
                    <Input autoCorrect={false} autoCapitalize="none" placeholder="••••••••" value={password} secureTextEntry={!showPassword} onChangeText={setPassword} />
                </View>

                <View className="gap-1.5">
                    <Text className="font-jakarta-bold text-sm">Confirm New Password</Text>
                    <Input autoCorrect={false} autoCapitalize="none" placeholder="••••••••" value={confirmPassword} secureTextEntry={!showPassword} onChangeText={setConfirmPassword} />
                </View>

                {error ? <Text className="text-destructive text-sm">{error}</Text> : null}

                <Button onPress={handleReset} disabled={isSubmitting} className="mt-1">
                    {isSubmitting ? "Updating..." : "Update Password"}
                </Button>

                <View className="mt-2 flex-row justify-center">
                    <Link href="/(auth)/sign-in" asChild>
                        <Pressable>
                            <Text className="text-muted-foreground font-jakarta-medium text-sm">
                                Remember your password? <Text className="font-jakarta-bold text-amber">Sign In</Text>
                            </Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </Screen>
    );
}
