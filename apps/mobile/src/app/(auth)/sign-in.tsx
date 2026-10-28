import ErrorMessage from "@/components/error-message";
import Button from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
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

    const signInWithPasswordMt = useMutation({
        mutationFn: async () => {
            const parsed = signInSchema.parse({ email, password });

            const { error } = await supabase.auth.signInWithPassword({ ...parsed });

            if (error) {
                throw error;
            }
        },
        onSuccess: () => {
            router.replace("/(app)");
        },
    });

    return (
        <Screen fullscreen className="justify-center gap-8">
            <View className="max-w-86 items-start">
                <Text className="font-bebas text-6xl">Welcome Back</Text>
                <Text className="text-muted-foreground text-xl font-medium">Sign in to your account to continue</Text>
            </View>

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

                <ErrorMessage message={signInWithPasswordMt.error?.message} />

                <Button onPress={() => signInWithPasswordMt.mutateAsync()} disabled={signInWithPasswordMt.isPending} size={"lg"} className="mt-1" right={ArrowRight}>
                    <Text className="font-bebas text-center text-3xl">{signInWithPasswordMt.isPending ? "Signing In..." : "Sign In"}</Text>
                </Button>

                <View className="mt-2 flex-row justify-center">
                    <Link href="/(auth)/sign-up" asChild>
                        <Pressable>
                            <Text className="text-muted-foreground text-lg font-medium">
                                Don&apos;t have an account? <Text className="font-bold underline">Sign Up</Text>
                            </Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </Screen>
    );
}
