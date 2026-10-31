import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { useSearchUsersInfinite } from "@/hooks/tan-stack/user";
import ErrorMessage from "@/components/common/error-message";
import LargeHeader from "@/components/common/large-header";
import { Search, UserRound, X } from "lucide-react-native";
import { SkeletonCard } from "@/components/ui/skeleton";
import useDebounce from "@/hooks/custom/use-debounce";
import EmptyState from "@/components/ui/empty-state";
import { useColor } from "@/hooks/custom/use-color";
import { getLevel } from "@/utils/helper-functions";
import { Input } from "@/components/ui/input";
import Text from "@/components/ui/text";
import { router } from "expo-router";
import { useState } from "react";
import { cn } from "cn";


const AVATAR_COLORS = ["bg-lime", "bg-pink", "bg-amber", "bg-purple"];

export default function SearchScreen() {
    const color = useColor();

    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300);

    const usersQuery = useSearchUsersInfinite(debouncedQuery, debouncedQuery.trim().length >= 2);
    const showEmpty = debouncedQuery.trim().length >= 2 && !usersQuery.isFetching && !usersQuery.isError && usersQuery.data.length === 0;

    return (
        <FlatList
            data={usersQuery.data}
            onEndReachedThreshold={0.5}
            keyboardDismissMode="on-drag"
            keyExtractor={(user) => user.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            style={{ flex: 1, backgroundColor: color.background }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24, gap: 12, flexGrow: 1 }}
            onEndReached={() => {
                if (usersQuery.hasNextPage && !usersQuery.isFetchingNextPage) void usersQuery.fetchNextPage();
            }}
            ListHeaderComponent={
                <View className="gap-4 pb-2">
                    <LargeHeader header="Find Players" />

                    <View className="relative">
                        <View className="absolute top-1/2 left-4 z-10 -translate-y-1/2">
                            <Search size={20} color={color.mutedForeground} strokeWidth={2.5} />
                        </View>

                        <Input
                            value={query}
                            autoCorrect={false}
                            autoCapitalize="none"
                            onChangeText={setQuery}
                            placeholder="Search by name or username..."
                            placeholderTextColor={color.mutedForeground}
                            className="border-foreground shadow-nb-sm bg-card font-jakarta-bold border-2 pr-12 pl-12"
                        />
                        {query.length > 0 ? (
                            <Pressable onPress={() => setQuery("")} className="absolute top-1/2 right-4 z-10 -translate-y-1/2" hitSlop={12} accessibilityRole="button" accessibilityLabel="Clear search query">
                                <X size={18} color={color.foreground} strokeWidth={2.5} />
                            </Pressable>
                        ) : null}
                    </View>
                </View>
            }
            ListEmptyComponent={
                usersQuery.isFetching ? (
                    <View className="gap-3 pt-2">
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
            ListFooterComponent={usersQuery.isFetchingNextPage ? <ActivityIndicator className="py-4" color={color.foreground} /> : undefined}
        />
    );
}
