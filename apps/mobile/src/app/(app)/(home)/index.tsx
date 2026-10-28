import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useGetUser } from "@/hooks/tan-stack/user";
import { View } from "react-native";

export default function Home() {
    const userQuery = useGetUser();

    return (
        <Screen fullscreen className="py-16">
            <View className="flex-1">
                <Text className="font-bebas text-7xl">
                    {userQuery.data?.name}
                    <Text className="font-bebas text-3xl"> @{userQuery.data?.username}</Text>
                </Text>
                <Text className="font-bebas text-2xl">Experience: {userQuery.data?.experience} xp</Text>
                <Text className="font-bebas text-2xl">Current: {userQuery.data?.streak} days</Text>
                <Text className="font-bebas text-2xl">Longest: {userQuery.data?.longestStreak} days</Text>
                <Text className="font-bebas text-2xl">Visibility: {userQuery.data?.public ? "Public" : "Private"}</Text>
            </View>
        </Screen>
    );
}
