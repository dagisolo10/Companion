import BackButton from "@/components/back-button";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import { SkeletonCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useGetUser, useIsUsernameAvailable, useUpdateUser } from "@/hooks/tan-stack/user";
import { UpdateUserDto } from "@/types/dto";
import { User } from "@/types/models";
import { router } from "expo-router";
import { CheckCircle2, XCircle } from "lucide-react-native";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function EditProfile() {
    const userQuery = useGetUser();

    if (userQuery.isFetching) {
        return (
            <Screen className="gap-5">
                <View className="flex-row items-center gap-3">
                    <BackButton />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">Edit Profile</Text>
                </View>
                <SkeletonCard lines={3} />
            </Screen>
        );
    }

    if (userQuery.error || !userQuery.data) {
        return (
            <Screen fullscreen className="items-center justify-center">
                <Text className="text-destructive text-sm">{userQuery.error?.message || "User not found"}</Text>
            </Screen>
        );
    }

    return <EditProfileForm user={userQuery.data} />;
}

function EditProfileForm({ user }: { user: User }) {
    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username);

    const updateUserMt = useUpdateUser();
    const usernameAvailableQuery = useIsUsernameAvailable(username, { enabled: username.length >= 3 && username !== user.username });

    function handleSubmit() {
        if (!name.trim() || !username.trim()) {
            Alert.alert("Missing fields", "Please fill in all fields.");
            return;
        }
        if (username.length < 3) {
            Alert.alert("Invalid username", "Username must be at least 3 characters.");
            return;
        }
        if (username !== user.username && usernameAvailableQuery.data === false) {
            Alert.alert("Username taken", "This username is already in use.");
            return;
        }
        const dto: UpdateUserDto = { name: name.trim(), username: username.trim() };
        updateUserMt.mutate(dto, { onSuccess: () => router.back(), onError: (err) => Alert.alert("Error", err.message) });
    }

    return (
        <Screen className="gap-5">
            <View className="flex-row items-center gap-3">
                <BackButton />
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">Edit Profile</Text>
            </View>

            <View className="gap-1.5">
                <Text className="font-jakarta-bold text-sm">Name</Text>
                <Input placeholder="Your name" value={name} onChangeText={setName} />
            </View>

            <View className="gap-1.5">
                <Text className="font-jakarta-bold text-sm">Username</Text>
                <Input placeholder="username" value={username} onChangeText={setUsername} autoCapitalize="none" />
                {username.length >= 3 && username !== user.username && (
                    <View className="mt-1 flex-row items-center gap-1.5">
                        {usernameAvailableQuery.isFetching ? (
                            <Text className="text-muted-foreground font-jakarta-bold text-xs">Checking availability...</Text>
                        ) : usernameAvailableQuery.data ? (
                            <View className="flex-row items-center gap-1">
                                <CheckCircle2 size={14} color="#22C55E" strokeWidth={2.5} />
                                <Text className="font-jakarta-bold text-lime text-xs">Username available</Text>
                            </View>
                        ) : (
                            <View className="flex-row items-center gap-1">
                                <XCircle size={14} color="#DC2626" strokeWidth={2.5} />
                                <Text className="font-jakarta-bold text-destructive text-xs">Username taken</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

            <Button onPress={handleSubmit} disabled={updateUserMt.isPending} className="mt-2">
                {updateUserMt.isPending ? "Saving..." : "Save Changes"}
            </Button>
        </Screen>
    );
}
