import ErrorMessage from "@/components/common/error-message";
import BackButton from "@/components/common/back-button";
import { Eye, EyeOff, Lock } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { useColor } from "@/hooks/custom/use-color";
import { InputField } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import useToast from "@/hooks/custom/use-toast";
import { Pressable, View } from "react-native";
import Screen from "@/components/ui/screen";
import Button from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Text from "@/components/ui/text";
import { router } from "expo-router";
import { useState } from "react";


export default function ChangePassword() {
    const color = useColor();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const changePasswordMt = useMutation({
        mutationFn: async () => {
            if (!user?.email) throw new Error("You must be signed in to change your password.");
            if (!currentPassword) throw new Error("Please enter your current password.");
            if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
            if (newPassword !== confirmPassword) throw new Error("Passwords do not match.");
            if (currentPassword === newPassword) throw new Error("New password must be different from your current password.");

            const { error: confirmError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });

            if (confirmError) throw new Error("Your current password is incorrect.");

            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
        },
        onSuccess: () => {
            showToast({ title: "Password updated", description: "Your password has been changed successfully.", variant: "success" });
            router.back();
        },
    });

    const passwordToggle = (
        <Pressable onPress={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2">
            {showPassword ? <EyeOff size={20} color={color.mutedForeground} /> : <Eye size={20} color={color.mutedForeground} />}
        </Pressable>
    );

    return (
        <Screen className="gap-6">
            <BackButton label="Change Password" />

            <Text className="text-muted-foreground text-sm font-medium">Enter your current password to confirm your identity, then choose a new password.</Text>

            <View className="gap-1.5">
                <Text className="text-sm font-bold">Current Password</Text>
                <InputField icon={Lock} right={passwordToggle} value={currentPassword} autoCorrect={false} autoCapitalize="none" placeholder="••••••••" secureTextEntry={!showPassword} onChangeText={setCurrentPassword} />
            </View>

            <View className="gap-1.5">
                <Text className="text-sm font-bold">New Password</Text>
                <InputField icon={Lock} right={passwordToggle} value={newPassword} autoCorrect={false} autoCapitalize="none" placeholder="••••••••" secureTextEntry={!showPassword} onChangeText={setNewPassword} />
            </View>

            <View className="gap-1.5">
                <Text className="text-sm font-bold">Confirm New Password</Text>
                <InputField icon={Lock} right={passwordToggle} value={confirmPassword} autoCorrect={false} autoCapitalize="none" placeholder="••••••••" secureTextEntry={!showPassword} onChangeText={setConfirmPassword} />
            </View>

            <ErrorMessage message={changePasswordMt.error?.message} />

            <Button onPress={() => changePasswordMt.mutateAsync()} disabled={changePasswordMt.isPending} size={"lg"} className="mt-2">
                <Text className="font-bebas text-center text-3xl">{changePasswordMt.isPending ? "Updating..." : "Update Password"}</Text>
            </Button>
        </Screen>
    );
}
