import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSearchUsers } from "@/hooks/tan-stack/user";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Search, UserRound } from "lucide-react-native";
import useDebounce from "@/hooks/custom/use-debounce";
import EmptyState from "@/components/ui/empty-state";
import { useColor } from "@/hooks/custom/use-color";
import { getLevel } from "@/utils/helper-functions";
import Text from "@/components/ui/text";
import ErrorMessage from "@/components/error-message";
import { cn } from "cn";


const AVATAR_COLORS = ["bg-lime", "bg-pink", "bg-amber", "bg-purple"];

export default function SearchScreen() {
    const color = useColor();

    const { query = "" } = useLocalSearchParams<{ query?: string }>();
    const debouncedQuery = useDebounce(query, 300);

    const usersQuery = useSearchUsers(debouncedQuery, {
        enabled: debouncedQuery.trim().length >= 2,
    });
    const showEmpty = debouncedQuery.trim().length >= 2 && !usersQuery.isFetching && !usersQuery.isError && usersQuery.data.length === 0;

    return (
        <ScrollView
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            style={{ backgroundColor: color.background }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 20 }}
        >
            {usersQuery.isFetching && (
                <View className="gap-3">
                    <SkeletonCard lines={1} />
                    <SkeletonCard lines={1} />
                </View>
            )}

            {!usersQuery.isFetching && !usersQuery.isError && usersQuery.data.length > 0 && (
                <View className="gap-3">
                    {usersQuery.data.map((user, index) => {
                        const bgColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                        const initial = user.name.charAt(0).toUpperCase();

                        return (
                            <View key={user.id}>
                                <Pressable onPress={() => router.push({ pathname: "/(app)/user/[username]", params: { username: user.username } })} className="shadow-nb-sm border-foreground bg-card flex-row items-center gap-3 rounded-2xl border-2 p-4">
                                    <View className={cn(bgColor, "border-foreground shadow-nb-sm h-12 w-12 items-center justify-center rounded-xl border-2")}>
                                        <Text className="text-lg font-extrabold text-black">{initial}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold">{user.name}</Text>
                                        <Text className="text-muted-foreground text-xs font-bold">@{user.username}</Text>
                                    </View>
                                    <Text className="text-muted-foreground text-xs font-extrabold">Lv {getLevel(user.experience).level}</Text>
                                </Pressable>
                            </View>
                        );
                    })}
                </View>
            )}

            {!usersQuery.isFetching && usersQuery.isError && <ErrorMessage message={usersQuery.error.message || "Failed to search players."} />}

            {showEmpty && <EmptyState icon={UserRound} title="No players found" description={`No one matches "${debouncedQuery}".`} />}

            {debouncedQuery.trim().length < 2 && <EmptyState icon={Search} title="Search players" description="Type at least 2 characters to find players by name or username." />}
        </ScrollView>
    );
}
