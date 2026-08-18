import ErrorMessage from "@/components/error-message";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/use-color";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const signUpSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignUp() {
    const color = useColor();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [isSigningUp, setIsSigningUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function signUpNewUser() {
        if (isSigningUp) return;

        setError(null);
        setIsSigningUp(true);

        try {
            const parsed = signUpSchema.parse({ name, email, username, password });

            const normalizedName = parsed.name.trim();
            const normalizedUsername = parsed.username.trim().toLowerCase();

            const available = await requestApi(() => api.get<boolean>(`/user/username/${normalizedUsername}`));

            if (!available) {
                return setError("Username is already taken");
            }

            const response = await supabase.auth.signUp({
                email: parsed.email,
                password: parsed.password,
                options: { data: { name: normalizedName, username: normalizedUsername } },
            });

            if (response.error) {
                return setError(response.error.message);
            }

            router.replace("/");
        } catch (err) {
            setError(err instanceof z.ZodError ? err.issues[0]!.message : "An unexpected error occurred");
        } finally {
            setIsSigningUp(false);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="my-auto gap-6 px-6 py-8">
                        <View className="gap-2">
                            <Text className="text-foreground text-3xl font-bold">Create Account</Text>
                            <Text className="text-muted-foreground text-base">Sign up to get started with your account</Text>
                        </View>

                        <View className="gap-4">
                            <View className="gap-1.5">
                                <Text className="text-foreground text-sm font-semibold">Name</Text>
                                <TextInput className="border-border bg-card text-foreground h-12 w-full rounded-xl border pr-4 pl-4" value={name} onChangeText={setName} placeholder="Bob" placeholderTextColor="#a3a3a3" autoCorrect={false} />
                            </View>

                            <View className="gap-1.5">
                                <Text className="text-foreground text-sm font-semibold">Username</Text>
                                <TextInput className="border-border bg-card text-foreground h-12 w-full rounded-xl border pr-4 pl-4" value={username} onChangeText={setUsername} placeholder="bob" placeholderTextColor="#a3a3a3" autoCapitalize="none" autoCorrect={false} />
                            </View>

                            <View className="gap-1.5">
                                <Text className="text-foreground text-sm font-semibold">Email</Text>
                                <TextInput
                                    className="border-border bg-card text-foreground h-12 w-full rounded-xl border pr-4 pl-4"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="bob@gmail.com"
                                    placeholderTextColor="#a3a3a3"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                    autoCapitalize="none"
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

                            <Pressable onPress={signUpNewUser} disabled={isSigningUp} className="bg-primary mt-2 h-12 flex-row items-center justify-center gap-2 rounded-xl active:opacity-90 disabled:opacity-50">
                                {isSigningUp ? <ActivityIndicator color="#ffffff" /> : <Text className="text-primary-foreground text-base font-semibold">Agree & Sign Up</Text>}
                            </Pressable>

                            <View className="mt-4 flex-row justify-center">
                                <Link href="/(auth)/sign-in" asChild>
                                    <Pressable>
                                        <Text className="text-muted-foreground text-sm">
                                            Already have an account? <Text className="text-primary font-semibold">Sign In</Text>
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
