import Text from "@/components/ui/text";
import { useColor } from "@/hooks/use-color";
import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const signInSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignIn() {
    const color = useColor();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function signInWithPassword() {
        if (isSigningIn) return;

        setError(null);

        try {
            const parsed = signInSchema.parse({ email, password });

            setIsSigningIn(true);

            const response = await supabase.auth.signInWithPassword({
                email: parsed.email,
                password: parsed.password,
            });

            if (response.error) {
                setError(response.error.message);
            } else {
                router.replace("/");
            }
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.issues[0]!.message);
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsSigningIn(false);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="my-auto gap-6 px-6 py-8">
                        <View className="gap-2">
                            <Text className="text-foreground text-3xl font-bold">Welcome Back</Text>
                            <Text className="text-muted-foreground text-base">Sign in to your account to continue</Text>
                        </View>

                        <View className="gap-4">
                            <View className="gap-1.5">
                                <Text className="text-foreground text-sm font-semibold">Email</Text>
                                <TextInput
                                    className="border-border bg-card text-foreground h-12 w-full rounded-xl border pr-4 pl-4"
                                    value={email}
                                    autoComplete="email"
                                    autoCapitalize="none"
                                    onChangeText={setEmail}
                                    placeholder="bob@gmail.com"
                                    keyboardType="email-address"
                                    placeholderTextColor="#a3a3a3"
                                />
                            </View>

                            <View className="gap-1.5">
                                <Text className="text-foreground text-sm font-semibold">Password</Text>
                                <TextInput
                                    className="border-border bg-card text-foreground h-12 w-full rounded-xl border pr-4 pl-4"
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor="#a3a3a3"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <ErrorMessage message={error} />

                            <Pressable onPress={signInWithPassword} disabled={isSigningIn} className="bg-primary mt-2 h-12 flex-row items-center justify-center gap-2 rounded-xl active:opacity-90 disabled:opacity-50">
                                {isSigningIn ? <ActivityIndicator color="#ffffff" /> : <Text className="text-primary-foreground text-base font-semibold">Sign In</Text>}
                            </Pressable>

                            <View className="mt-4 flex-row justify-center">
                                <Link href="/(auth)/sign-up" asChild>
                                    <Pressable>
                                        <Text className="text-muted-foreground text-sm">
                                            Don&apos;t have an account? <Text className="text-primary font-semibold">Sign Up</Text>
                                        </Text>
                                    </Pressable>
                                </Link>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export function ErrorMessage({ message }: { message?: string | null }) {
    if (!message) return null;
    return <Text className="text-destructive text-sm font-semibold">{message}</Text>;
}
