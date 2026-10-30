import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Eye, EyeOff } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Button from "@/components/ui/button";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import Text from "@/components/ui/text";
import { useState } from "react";


export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const { endPasswordRecovery } = useAuth();

    const resetPasswordMt = useMutation({
        onSuccess: async () => {
            await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
            endPasswordRecovery();
            router.replace("/(auth)/sign-in");
        },
        mutationFn: async () => {
            if (!password || !confirmPassword) throw new Error("Please fill in all fields.");
            if (password.length < 6) throw new Error("Password must be at least 6 characters.");
            if (password !== confirmPassword) throw new Error("Passwords do not match.");

            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
        },
    });

    return (
        <Screen fullscreen className="justify-center gap-8">
            <View className="gap-2">
                <Text className="text-3xl font-extrabold tracking-tight">Set New Password</Text>
                <Text className="text-muted-foreground text-sm font-medium">Enter your new password below.</Text>
            </View>

            <View className="gap-5">
                <View className="gap-1.5">
                    <Text className="text-sm font-bold">New Password</Text>
                    <View className="relative justify-center">
                        <Input className="pr-12" autoCorrect={false} autoCapitalize="none" placeholder="••••••••" value={password} secureTextEntry={!showPassword} onChangeText={setPassword} />
                        <Pressable onPress={() => setShowPassword(!showPassword)} className="absolute right-4 py-2">
                            {showPassword ? <EyeOff size={20} color="#f59e0b" /> : <Eye size={20} color="#f59e0b" />}
                        </Pressable>
                    </View>
                </View>

                <View className="gap-1.5">
                    <Text className="text-sm font-bold">Confirm New Password</Text>
                    <View className="relative justify-center">
                        <Input className="pr-12" autoCorrect={false} autoCapitalize="none" placeholder="••••••••" value={confirmPassword} secureTextEntry={!showPassword} onChangeText={setConfirmPassword} />
                        <Pressable onPress={() => setShowPassword(!showPassword)} className="absolute right-4 py-2">
                            {showPassword ? <EyeOff size={20} color="#f59e0b" /> : <Eye size={20} color="#f59e0b" />}
                        </Pressable>
                    </View>
                </View>

                {resetPasswordMt.error ? <Text className="text-destructive text-sm">{resetPasswordMt.error.message}</Text> : null}

                <Button onPress={() => resetPasswordMt.mutateAsync()} disabled={resetPasswordMt.isPending} size={"lg"} className="mt-1">
                    <Text>{resetPasswordMt.isPending ? "Updating..." : "Update Password"}</Text>
                </Button>

                <View className="mt-2 flex-row justify-center">
                    <Link href="/(auth)/sign-in" asChild>
                        <Pressable>
                            <Text className="text-muted-foreground text-sm font-medium">
                                Remember your password? <Text className="text-amber font-bold">Sign In</Text>
                            </Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </Screen>
    );
}
