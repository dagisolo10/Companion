import Text from "@/components/ui/text";
import { useGetUser } from "@/hooks/tan-stack/user";
import { useColor } from "@/hooks/use-color";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
    const color = useColor();
    const { data: user } = useGetUser();

    const { data, isFetching, refetch } = useQuery({
        enabled: false,
        queryKey: ["hello"],
        queryFn: async () => requestApi(() => api.get<{ text: string; timestamp: number }>("/app/hello")),
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="my-auto flex-1 justify-center gap-4 px-6 py-8">
                        <Text className={cn("text-primary text-center text-5xl font-bold")}>Welcome to Nativewind!</Text>

                        <Text className="text-center">{process.env["EXPO_PUBLIC_SERVER_URL"]}</Text>

                        {isFetching && <ActivityIndicator size={"small"} />}

                        <Text className="text-center">{data?.text}</Text>
                        <Text className="text-center">{data?.timestamp}</Text>

                        <Text className="text-center">Name {user?.name}</Text>
                        <Text className="text-center">Username {user?.username}</Text>

                        <Link href={"/reset-password"}>
                            <Text className="text-center text-xl">Reset Password</Text>
                        </Link>

                        <Pressable className="bg-primary mt-2 h-12 flex-row items-center justify-center gap-2 rounded-xl active:opacity-90 disabled:opacity-50" onPress={async () => await supabase.auth.signOut()}>
                            <Text className="text-primary-foreground text-base font-semibold">Log out</Text>
                        </Pressable>

                        <Pressable className="bg-primary mt-2 h-12 flex-row items-center justify-center gap-2 rounded-xl active:opacity-90 disabled:opacity-50" onPress={() => refetch()}>
                            <Text className="text-primary-foreground text-base font-semibold">Request</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
