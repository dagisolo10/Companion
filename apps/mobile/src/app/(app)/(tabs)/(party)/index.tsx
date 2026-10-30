import BackButton from "@/components/common/back-button";
import LargeHeader from "@/components/common/large-header";
import PartyCard from "@/components/party/party-card";
import SectionHeader from "@/components/common/section-header";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import { SkeletonPartyList } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import useDebounce from "@/hooks/custom/use-debounce";
import { useGetAllPartiesInfinite, useGetMyParties } from "@/hooks/tan-stack/party";
import { router } from "expo-router";
import { Compass, Plus, Search, UserPlus, Users } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

export default function PartiesScreen() {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    const myPartiesQuery = useGetMyParties();
    const allPartiesQuery = useGetAllPartiesInfinite(debouncedSearch.trim() || undefined);

    const discoverParties = useMemo(() => {
        const myPartyIds = new Set(myPartiesQuery.data.map((party) => party.id));
        return allPartiesQuery.data.filter((party) => !myPartyIds.has(party.id));
    }, [allPartiesQuery.data, myPartiesQuery.data]);

    if (myPartiesQuery.isFetching) {
        return (
            <Screen className="gap-5">
                <BackButton label="Parties" />
                <SkeletonPartyList count={4} />
            </Screen>
        );
    }

    return (
        <Screen nonScrollable>
            <FlatList
                style={{ flex: 1 }}
                data={discoverParties}
                keyExtractor={(party) => party.id}
                contentContainerStyle={{ gap: 12, paddingBottom: 24, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                onEndReached={() => {
                    if (allPartiesQuery.hasNextPage && !allPartiesQuery.isFetchingNextPage) void allPartiesQuery.fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={
                    <View className="mb-2 gap-6">
                        <LargeHeader header="Parties" />
                        <View className="flex-row gap-3">
                            <Button className="flex-1" asChild onPress={() => router.push("/(app)/(tabs)/(party)/create")}>
                                <Plus size={16} color="#000000" strokeWidth={2.5} />
                                <Text className="text-sm font-bold">Create Party</Text>
                            </Button>

                            <Button className="flex-1" variant="outline" asChild onPress={() => router.push("/(app)/(tabs)/(party)/join")}>
                                <UserPlus size={16} color="#000000" strokeWidth={2.5} />
                                <Text className="text-sm font-bold">Join Party</Text>
                            </Button>
                        </View>
                        <View className="gap-4">
                            <SectionHeader title="My Parties" />

                            {myPartiesQuery.data.length === 0 ? (
                                <EmptyState icon={Users} title="No parties yet" description="Create a party or join one to start questing with friends." />
                            ) : (
                                <View className="gap-3 px-1">
                                    {myPartiesQuery.data.map((party) => (
                                        <PartyCard key={party.id} party={party} />
                                    ))}
                                </View>
                            )}
                        </View>
                        <View className="gap-4">
                            <SectionHeader title="Discover Parties" icon={Compass} />

                            <View className="justify-center">
                                <View className="absolute left-3.5 z-10">
                                    <Search size={18} color="#888" strokeWidth={2.5} />
                                </View>
                                <Input placeholder="Search parties by name or code..." value={search} onChangeText={setSearch} autoCapitalize="none" autoCorrect={false} className="pl-11" />
                            </View>

                            {allPartiesQuery.isLoading && <SkeletonPartyList count={3} />}
                        </View>
                    </View>
                }
                renderItem={({ item: party }) => <PartyCard party={party} />}
                ListEmptyComponent={!allPartiesQuery.isLoading ? <EmptyState icon={Compass} title={search ? "No parties found" : "No other parties"} description={search ? "Try a different name or code." : "There are no other parties to discover right now."} /> : undefined}
                ListFooterComponent={allPartiesQuery.isFetchingNextPage ? <ActivityIndicator /> : undefined}
            />
        </Screen>
    );
}
