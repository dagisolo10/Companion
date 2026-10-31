import BackButton from "@/components/common/back-button";
import ProfileView, { SkeletonProfileView } from "@/components/profile/profile";
import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { useFindUser } from "@/hooks/tan-stack/user";
import { useLocalSearchParams } from "expo-router";

export default function PlayerProfileScreen() {
    const { username } = useLocalSearchParams<{ username: string }>();
    const userQuery = useFindUser(username!, { enabled: !!username });

    if (userQuery.isPending) {
        return <SkeletonProfileView back />;
    }

    if (userQuery.error || !userQuery.data) {
        return (
            <Screen className="gap-5">
                <BackButton label="Profile" />
                <Text className="text-destructive font-jakarta-bold text-sm">{userQuery.error?.message || "User not found"}</Text>
            </Screen>
        );
    }

    return (
        <Screen className="gap-5">
            <BackButton label="Profile" />
            <ProfileView user={userQuery.data} />
        </Screen>
    );
}
