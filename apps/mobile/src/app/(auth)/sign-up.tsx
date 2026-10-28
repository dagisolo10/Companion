import ErrorMessage from "@/components/error-message";
import Button from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { ArrowRight, AtSign, Eye, EyeOff, Lock, Mail, User2 } from "lucide-react-native";
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
    const color = useColor();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const signUpNewUserMt = useMutation({
        mutationFn: async () => {
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
                throw new Error("Username is already taken");
            }

            const response = await supabase.auth.signUp({
                email: parsed.email,
                password: parsed.password,
                options: { data: { name: normalizedName, username: normalizedUsername } },
            });

            if (response.error) {
                throw new Error(response.error.message);
            }
        },
        onSuccess: () => {
            router.replace("/(app)");
        },
    });

    return (
        <Screen fullscreen className="justify-center gap-8">
            <View className="max-w-86 items-start gap-1">
                <Text className="font-bebas text-6xl">Create Your Account</Text>
                <Text className="text-muted-foreground text-xl font-medium">Sign up to get started with your account</Text>
            </View>

            <View className="gap-5">
                <InputField icon={User2} value={name} onChangeText={setName} placeholder="Bob" autoCorrect={false} />
                <InputField icon={AtSign} value={username} onChangeText={setUsername} placeholder="bob" autoCapitalize="none" autoCorrect={false} />
                <InputField icon={Mail} value={email} onChangeText={setEmail} placeholder="bob@gmail.com" keyboardType="email-address" autoComplete="email" autoCapitalize="none" />
                <InputField
                    icon={Lock}
                    right={
                        <Pressable onPress={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2">
                            {showPassword ? <EyeOff size={20} color={color.mutedForeground} /> : <Eye size={20} color={color.mutedForeground} />}
                        </Pressable>
                    }
                    value={password}
                    autoCorrect={false}
                    autoCapitalize="none"
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    onChangeText={setPassword}
                />

                <ErrorMessage message={signUpNewUserMt.error?.message} />

                <Button onPress={() => signUpNewUserMt.mutateAsync()} disabled={signUpNewUserMt.isPending} size={"lg"} className="mt-1" right={ArrowRight}>
                    <Text className="font-bebas text-center text-3xl">{signUpNewUserMt.isPending ? "Signing Up..." : "Agree & Sign Up"}</Text>
                </Button>

                <View className="mt-2 flex-row justify-center">
                    <Link href="/(auth)/sign-in" asChild>
                        <Pressable>
                            <Text className="text-muted-foreground text-lg font-medium">
                                Already have an account? <Text className="font-bold underline">Sign In</Text>
                            </Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </Screen>
    );
}
