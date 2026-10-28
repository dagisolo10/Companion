import BackButton from "@/components/back-button";
import Button from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import { SkeletonCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import useDebounce from "@/hooks/custom/use-debounce";
import { useGetUser, useIsUsernameAvailable, useUpdateUser } from "@/hooks/tan-stack/user";
import { User } from "@/types/models";
import { slugifyUsername } from "@/utils/helper-functions";
import { AlertCircle, AtSign, CheckCircle2, Save, User2, XCircle } from "lucide-react-native";
import { useState } from "react";
import { Alert, Switch, View } from "react-native";

export default function EditProfile() {
    const userQuery = useGetUser();

    if (userQuery.isFetching) {
        return (
            <Screen className="gap-5">
                <BackButton label="Edit Profile" />
                <SkeletonCard lines={1} />
                <SkeletonCard lines={1} />
                <SkeletonCard lines={2} />
                <SkeletonCard lines={2} />
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
    const [isPublic, setIsPublic] = useState(user.public);
    const [username, setUsername] = useState(user.username);
    const [apiError, setApiError] = useState<string | null>(null);

    const slugValue = slugifyUsername(username);
    const debounced = useDebounce(slugValue, 1000);

    const updateUserMutation = useUpdateUser();
    const usernameAvailableQuery = useIsUsernameAvailable(debounced, { enabled: debounced.length >= 3 && debounced !== user.username });

    const activeErrors: string[] = [];

    if (!name.trim()) activeErrors.push("Name cannot be empty.");
    if (!username.trim()) activeErrors.push("Username cannot be empty.");
    if (slugValue.length > 0 && slugValue.length < 3) activeErrors.push("Username must be at least 3 characters.");
    if (slugValue.length >= 3 && slugValue !== user.username && usernameAvailableQuery.data === false) activeErrors.push("Selected username is already taken.");
    if (apiError) activeErrors.push(apiError);

    function handlePublicToggle(value: boolean) {
        setIsPublic(value);
        setApiError(null);
        updateUserMutation.mutate(
            { public: value },
            {
                onSuccess: (data) => {
                    Alert.alert(`Visibility Updated. Your profile is now ${data.public ? "publicly accessible" : "private"}`);
                },
                onError: (err) => {
                    setIsPublic(!value);
                    setApiError(err.message || "Failed to update profile visibility.");
                },
            },
        );
    }

    function handleSubmit() {
        if (activeErrors.length > 0) return;

        setApiError(null);
        updateUserMutation.mutate(
            { name: name.trim(), username: slugValue },
            {
                onSuccess: () => Alert.alert("Profile Updated"),
                onError: (err) => setApiError(err.message || "Failed to update profile."),
            },
        );
    }

    return (
        <Screen className="gap-6">
            <BackButton label="Edit Profile" />

            <InputField
                icon={User2}
                placeholder="Your name"
                value={name}
                onChangeText={(val) => {
                    setName(val);
                    if (apiError) setApiError(null);
                }}
                clearButtonMode="while-editing"
            />

            <View className="gap-1.5">
                <InputField
                    icon={AtSign}
                    placeholder="username"
                    value={username}
                    onChangeText={(val) => {
                        setUsername(val);
                        if (apiError) setApiError(null);
                    }}
                    autoCorrect={false}
                    autoCapitalize="none"
                    clearButtonMode="while-editing"
                />
                {username.length > 0 && (
                    <Text className="text-muted-foreground font-jakarta-medium px-1 text-xs">
                        Will be saved as: <Text className="font-jakarta-bold text-foreground">@{slugValue}</Text>
                    </Text>
                )}
            </View>

            {slugValue.length >= 3 && slugValue !== user.username && (
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

            {activeErrors.length > 0 && <LiveErrorCard errors={activeErrors} />}

            <View className="card flex-row items-center justify-between">
                <View className="flex-1 gap-0.5 pr-3">
                    <Text className="text-sm font-bold">Public profile</Text>
                    <Text className="text-muted-foreground font-jakarta-bold max-w-48 text-xs">Allow others to find you in search and view your profile.</Text>
                </View>
                <View className="justify-center">
                    <Switch value={isPublic} onValueChange={handlePublicToggle} />
                </View>
            </View>

            <Button onPress={handleSubmit} disabled={updateUserMutation.isPending || activeErrors.length > 0} size={"lg"} className="mt-2" right={Save}>
                <Text className="font-bebas text-center text-3xl">{updateUserMutation.isPending ? "Saving..." : "Save Changes"}</Text>
            </Button>
        </Screen>
    );
}

function LiveErrorCard({ errors }: { errors: string[] }) {
    return (
        <View className="bg-destructive/10 border-destructive shadow-nb gap-3 border-2 p-4">
            <View className="border-destructive/30 flex-row items-center gap-2 border-b pb-2">
                <AlertCircle size={18} color="#DC2626" strokeWidth={2.5} />
                <Text className="font-jakarta-extrabold text-destructive text-xs tracking-wider uppercase">Please fix the following issue{errors.length > 1 ? "s" : ""}</Text>
            </View>

            <View className="gap-1.5">
                {errors.map((error, idx) => (
                    <View key={idx} className="flex-row items-start gap-2">
                        <Text className="font-jakarta-extrabold text-destructive text-xs leading-5">•</Text>
                        <Text className="font-jakarta-bold text-destructive flex-1 text-xs leading-5">{error}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
