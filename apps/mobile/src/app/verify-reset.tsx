import { router, useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import * as Linking from "expo-linking";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import Button from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Text from "@/components/ui/text";
import { View } from "react-native";
import { useState } from "react";


export default function VerifyReset() {
    const [token, setToken] = useState("");
    const { email } = useLocalSearchParams<{ email: string }>();
    const { startPasswordRecovery, endPasswordRecovery } = useAuth();

    const verifyOtpMt = useMutation({
        onSuccess: () => router.replace("/reset-password"),
        mutationFn: async () => {
            if (!token.trim()) throw new Error("Please enter the code.");
            if (!email) throw new Error("Missing email. Go back and request a new code.");

            startPasswordRecovery();

            const { error } = await supabase.auth.verifyOtp({ email, token: token.trim(), type: "recovery" });

            if (error) {
                endPasswordRecovery();
                throw error;
            }
        },
    });

    const resendOtpMt = useMutation({
        mutationFn: async () => {
            if (!email) throw new Error("Missing email. Go back and request a new code.");
            const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: Linking.createURL("/reset-password") });
            if (error) throw error;
        },
    });

    return (
        <Screen fullscreen className="justify-center gap-8">
            <View className="gap-2">
                <Text className="text-3xl font-extrabold tracking-tight">Verify Code</Text>
                <Text className="text-muted-foreground text-sm font-medium">Enter the code sent to {email}.</Text>
            </View>

            <View className="gap-5">
                <View className="gap-1.5">
                    <Text className="text-sm font-bold">Code</Text>
                    <Input value={token} onChangeText={setToken} placeholder="123456" keyboardType="number-pad" autoCapitalize="none" />
                </View>

                {verifyOtpMt.error ? <Text className="text-destructive text-sm">{verifyOtpMt.error.message}</Text> : null}
                {resendOtpMt.error ? <Text className="text-destructive text-sm">{resendOtpMt.error.message}</Text> : null}
                {resendOtpMt.isSuccess ? <Text className="text-lime text-sm">A new code has been sent.</Text> : null}

                <Button onPress={() => verifyOtpMt.mutateAsync()} disabled={verifyOtpMt.isPending} size={"lg"} className="mt-1">
                    <Text>{verifyOtpMt.isPending ? "Verifying..." : "Verify"}</Text>
                </Button>
                <Button variant="outline" onPress={() => resendOtpMt.mutate()} disabled={resendOtpMt.isPending}>
                    <Text>{resendOtpMt.isPending ? "Sending..." : "Resend Code"}</Text>
                </Button>
            </View>
        </Screen>
    );
}
