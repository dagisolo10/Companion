import Button from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { Link, router } from "expo-router";
import { Mail } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const resetPasswordForEmailMt = useMutation({
        onSuccess: () => router.push({ pathname: "/verify-reset", params: { email: email.trim() } }),
        mutationFn: async () => {
            if (!email) throw new Error("Please enter your email.");

            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: Linking.createURL("/reset-password") });
            if (error) throw error;
        },
    });

    return (
        <Screen fullscreen className="justify-center gap-8">
            <View className="max-w-86 items-start">
                <Text className="font-bebas text-6xl">Forgot Password</Text>
                <Text className="text-muted-foreground text-xl font-medium">Enter your email address and we&apos;ll send you a code to verify ownership.</Text>
            </View>

            <View className="gap-5">
                <InputField icon={Mail} value={email} onChangeText={setEmail} placeholder="bob@gmail.com" keyboardType="email-address" autoComplete="email" autoCapitalize="none" />

                {resetPasswordForEmailMt.error ? <Text className="text-destructive text-sm">{resetPasswordForEmailMt.error.message}</Text> : null}

                <Button onPress={() => resetPasswordForEmailMt.mutateAsync()} disabled={resetPasswordForEmailMt.isPending} size={"lg"} className="mt-1">
                    <Text className="font-bebas text-3xl">{resetPasswordForEmailMt.isPending ? "Sending..." : "Send Code"}</Text>
                </Button>

                <View className="mt-2 flex-row justify-center">
                    <Link asChild href="/(auth)/sign-in">
                        <Pressable>
                            <Text className="text-muted-foreground text-lg font-medium">
                                Remember your password? <Text className="font-bold underline">Sign In</Text>
                            </Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </Screen>
    );
}
