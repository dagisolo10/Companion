import EmptyState from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import useDebounce from "@/hooks/custom/use-debounce";
import { useSearchUsers } from "@/hooks/tan-stack/user";
import { cn } from "@/lib/utils";
import { getLevel } from "@/utils/helper-functions";
import { router, useLocalSearchParams } from "expo-router";
import { Search, UserRound } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";

const AVATAR_COLORS = ["bg-lime", "bg-pink", "bg-amber", "bg-purple"];

export default function SearchScreen() {
    const color = useColor();

    const { query = "" } = useLocalSearchParams<{ query?: string }>();
    const debouncedQuery = useDebounce(query, 300);

    const { data: users = [], isFetching } = useSearchUsers(debouncedQuery, { enabled: debouncedQuery.trim().length >= 2 });

    const showEmpty = debouncedQuery.trim().length >= 2 && !isFetching && users.length === 0;

    return (
        <ScrollView
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            style={{ backgroundColor: color.background }}
            contentContainerStyle={{ flex: 1, paddingHorizontal: 20, paddingVertical: 16, gap: 20 }}
        >
            {isFetching && (
                <View className="gap-3">
                    <SkeletonCard lines={1} />
                    <SkeletonCard lines={1} />
                </View>
            )}

            {!isFetching && users.length > 0 && (
                <View className="gap-3">
                    {users.map((user, index) => {
                        const bgColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                        const initial = user.name.charAt(0).toUpperCase();

                        return (
                            <View key={user.id}>
                                <Pressable onPress={() => router.push({ pathname: "/(app)/user/[username]", params: { username: user.username } })} className="shadow-nb-sm border-foreground bg-card flex-row items-center gap-3 rounded-2xl border-2 p-4">
                                    <View className={cn(bgColor, "border-foreground shadow-nb-sm h-12 w-12 items-center justify-center rounded-xl border-2")}>
                                        <Text className="font-jakarta-extrabold text-lg text-black">{initial}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-jakarta-extrabold text-sm">{user.name}</Text>
                                        <Text className="text-muted-foreground font-jakarta-bold text-xs">@{user.username}</Text>
                                    </View>
                                    <Text className="text-muted-foreground font-jakarta-extrabold text-xs">Lv {getLevel(user.experience).level}</Text>
                                </Pressable>
                            </View>
                        );
                    })}
                </View>
            )}

            {showEmpty && <EmptyState icon={UserRound} title="No players found" description={`No one matches "${debouncedQuery}".`} />}

            {debouncedQuery.trim().length < 2 && <EmptyState icon={Search} title="Search players" description="Type at least 2 characters to find players by name or username." />}
        </ScrollView>
    );
}
