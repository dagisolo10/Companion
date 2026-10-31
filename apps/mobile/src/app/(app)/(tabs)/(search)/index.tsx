import ErrorMessage from "@/components/common/error-message";
import LargeHeader from "@/components/common/large-header";
import EmptyState from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import useDebounce from "@/hooks/custom/use-debounce";
import { useSearchUsersInfinite } from "@/hooks/tan-stack/user";
import { getLevel } from "@/utils/helper-functions";
import { cn } from "cn";
import { router, useLocalSearchParams } from "expo-router";
import { Search, UserRound } from "lucide-react-native";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";

const AVATAR_COLORS = ["bg-lime", "bg-pink", "bg-amber", "bg-purple"];

export default function SearchScreen() {
    const color = useColor();

    const { query = "" } = useLocalSearchParams<{ query?: string }>();
    const debouncedQuery = useDebounce(query, 300);

    const usersQuery = useSearchUsersInfinite(debouncedQuery, debouncedQuery.trim().length >= 2);
    const showEmpty = debouncedQuery.trim().length >= 2 && !usersQuery.isFetching && !usersQuery.isError && usersQuery.data.length === 0;

    return (
        <FlatList
            style={{ flex: 1, backgroundColor: color.background }}
            data={usersQuery.data}
            keyExtractor={(user) => user.id}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 12, flexGrow: 1 }}
            onEndReached={() => {
                if (usersQuery.hasNextPage && !usersQuery.isFetchingNextPage) void usersQuery.fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
                usersQuery.isFetching ? (
                    <View className="gap-3">
                        <SkeletonCard lines={1} />
                        <SkeletonCard lines={1} />
                    </View>
                ) : debouncedQuery.trim().length < 2 ? (
                    <EmptyState icon={Search} title="Search players" description="Type at least 2 characters to find players by name or username." />
                ) : usersQuery.isError ? (
                    <ErrorMessage message={usersQuery.error.message || "Failed to search players."} />
                ) : showEmpty ? (
                    <EmptyState icon={UserRound} title="No players found" description={`No one matches "${debouncedQuery}".`} />
                ) : undefined
            }
            renderItem={({ item: user, index }) => {
                const bgColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                const initial = user.name.charAt(0).toUpperCase();

                return (
                    <View>
                        <Pressable onPress={() => router.push({ pathname: "/(app)/user/[username]", params: { username: user.username } })} className="shadow-nb-sm border-foreground bg-card flex-row items-center gap-3 border-2 p-4">
                            <View className={cn(bgColor, "border-foreground shadow-nb-sm h-12 w-12 items-center justify-center border-2")}>
                                <Text className="font-jakarta-extrabold text-lg text-black">{initial}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="font-jakarta-bold text-lg">{user.name}</Text>
                                <Text className="text-muted-foreground font-jakarta-bold text-xs">@{user.username}</Text>
                            </View>
                            <Text className="text-muted-foreground font-jakarta-extrabold text-xs">Lv {getLevel(user.experience).level}</Text>
                        </Pressable>
                    </View>
                );
            }}
            ListHeaderComponent={<LargeHeader header="Find Players" />}
            ListFooterComponent={usersQuery.isFetchingNextPage ? <ActivityIndicator /> : undefined}
        />
    );
}
