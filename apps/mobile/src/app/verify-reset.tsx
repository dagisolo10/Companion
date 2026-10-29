import { router, useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
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
    const verifyOtpMt = useMutation({
        onSuccess: () => router.replace("/reset-password"),
        mutationFn: async () => {
            if (!token) throw new Error("Please enter the code");
            if (!email) throw new Error("Missing email.");

            await supabase.auth.verifyOtp({ email, token, type: "recovery" });
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

                <Button onPress={() => verifyOtpMt.mutateAsync()} disabled={verifyOtpMt.isPending} size={"lg"} className="mt-1">
                    <Text>{verifyOtpMt.isPending ? "Verifying..." : "Verify"}</Text>
                </Button>
            </View>
        </Screen>
    );
}
