import BrandMark from "@/components/brand-mark";
import ErrorMessage from "@/components/error-message";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { Compass } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { z } from "zod";

const signUpSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignUp() {
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
            const parsed = signUpSchema.parse({
                email,
                password,
                name: name.trim(),
                username: username.trim().toLowerCase(),
            });

            const normalizedName = parsed.name;
            const normalizedUsername = parsed.username;

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

            router.replace("/(app)");
        } catch (err) {
            setError(err instanceof z.ZodError ? err.issues[0]!.message : "An unexpected error occurred");
        } finally {
            setIsSigningUp(false);
        }
    }

    return (
        <Screen fullscreen className="justify-center gap-8">
            <View className="items-center gap-3">
                <BrandMark icon={Compass} accent="bg-amber" size="lg" />
            </View>

            <View className="gap-2">
                <Text className="text-center font-jakarta-extrabold text-3xl tracking-tight">Create Account</Text>
                <Text className="text-muted-foreground text-center font-jakarta-medium text-sm">Sign up to get started with your account</Text>
            </View>

            <View className="gap-5">
                <View className="gap-1.5">
                    <Text className="font-jakarta-bold text-sm">Name</Text>
                    <Input value={name} onChangeText={setName} placeholder="Bob" autoCorrect={false} />
                </View>

                <View className="gap-1.5">
                    <Text className="font-jakarta-bold text-sm">Username</Text>
                    <Input value={username} onChangeText={setUsername} placeholder="bob" autoCapitalize="none" autoCorrect={false} />
                </View>

                <View className="gap-1.5">
                    <Text className="font-jakarta-bold text-sm">Email</Text>
                    <Input value={email} onChangeText={setEmail} placeholder="bob@gmail.com" keyboardType="email-address" autoComplete="email" autoCapitalize="none" />
                </View>

                <View className="gap-1.5">
                    <Text className="font-jakarta-bold text-sm">Password</Text>
                    <Input value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry autoCapitalize="none" autoCorrect={false} />
                </View>

                <ErrorMessage message={error} />

                <Button onPress={signUpNewUser} disabled={isSigningUp} className="mt-1">
                    {isSigningUp ? "Signing Up..." : "Agree & Sign Up"}
                </Button>

                <View className="mt-2 flex-row justify-center">
                    <Link href="/(auth)/sign-in" asChild>
                        <Pressable>
                            <Text className="text-muted-foreground font-jakarta-medium text-sm">
                                Already have an account? <Text className="font-jakarta-bold text-amber">Sign In</Text>
                            </Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </Screen>
    );
}
