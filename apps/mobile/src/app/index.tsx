import Text from "@/components/ui/text";
import { useColor } from "@/hooks/use-color";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Link } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
    const color = useColor();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="my-auto flex-1 items-center justify-center gap-4 px-6 py-8">
                        <Text className={cn("text-center text-5xl font-bold text-red-400")}>Welcome to Nativewind!</Text>
                        <Link href={"/reset-password"}>
                            <Text className="text-center text-xl">Reset Password</Text>
                        </Link>

                        <Pressable onPress={async () => await supabase.auth.signOut()}>
                            <Text className="text-center text-xl">Log out</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
