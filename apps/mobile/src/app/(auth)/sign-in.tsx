import BrandMark from "@/components/brand-mark";
import ErrorMessage from "@/components/error-message";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { Compass } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { z } from "zod";

const signInSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function signInWithPassword() {
        if (isSigningIn) return;

        setError(null);
        setIsSigningIn(true);

        try {
            const parsed = signInSchema.parse({ email, password });

            const response = await supabase.auth.signInWithPassword({ email: parsed.email, password: parsed.password });

            if (response.error) {
                return setError(response.error.message);
            }

            router.replace("/(app)");
        } catch (err) {
            setError(err instanceof z.ZodError ? err.issues[0]!.message : "An unexpected error occurred");
        } finally {
            setIsSigningIn(false);
        }
    }

    return (
        <Screen fullscreen className="justify-center gap-8">
            <View className="items-center gap-3">
                <BrandMark icon={Compass} accent="bg-amber" size="lg" />
            </View>

            <View className="gap-2">
                <Text className="text-center font-jakarta-extrabold text-3xl tracking-tight">Welcome Back</Text>
                <Text className="text-muted-foreground text-center font-jakarta-medium text-sm">Sign in to your account to continue</Text>
            </View>

            <View className="gap-5">
                <View className="gap-1.5">
                    <Text className="font-jakarta-bold text-sm">Email</Text>
                    <Input value={email} autoComplete="email" autoCapitalize="none" onChangeText={setEmail} placeholder="bob@gmail.com" keyboardType="email-address" />
                </View>

                <View className="gap-1.5">
                    <Text className="font-jakarta-bold text-sm">Password</Text>
                    <Input value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry autoCapitalize="none" autoCorrect={false} />
                </View>

                <ErrorMessage message={error} />

                <Button onPress={signInWithPassword} disabled={isSigningIn} className="mt-1">
                    {isSigningIn ? "Signing In..." : "Sign In"}
                </Button>

                <View className="mt-2 flex-row justify-center">
                    <Link href="/(auth)/sign-up" asChild>
                        <Pressable>
                            <Text className="text-muted-foreground font-jakarta-medium text-sm">
                                Don&apos;t have an account? <Text className="font-jakarta-bold text-amber">Sign Up</Text>
                            </Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </Screen>
    );
}
