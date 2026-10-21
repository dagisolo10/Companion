import BackButton from "@/components/back-button";
import PartyCard from "@/components/party/party-card";
import Button from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import Screen from "@/components/ui/screen";
import { SkeletonPartyList } from "@/components/ui/skeleton";
import Text from "@/components/ui/text";
import { useColor } from "@/hooks/custom/use-color";
import useDebounce from "@/hooks/custom/use-debounce";
import { useGetAllParties, useGetMyParties } from "@/hooks/tan-stack/party";
import { router } from "expo-router";
import { Compass, Plus, Search, UserPlus, Users } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

export default function PartiesScreen() {
    const color = useColor();
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    const { data: parties = [], isFetching } = useGetMyParties();
    const { data: allParties = [], isFetching: discovering } = useGetAllParties(debouncedSearch.trim() || undefined);

    const myPartyIds = new Set(parties.map((party) => party.id));
    const discoverParties = allParties.filter((party) => !myPartyIds.has(party.id));

    if (isFetching) {
        return (
            <Screen className="gap-5">
                <View className="flex-row items-center gap-3">
                    <BackButton />
                    <Text className="font-jakarta-extrabold text-2xl tracking-tight">Parties</Text>
                </View>
                <SkeletonPartyList count={4} />
            </Screen>
        );
    }

    return (
        <Screen className="gap-6">
            <View className="flex-row items-center gap-3">
                <BackButton />
                <Text className="font-jakarta-extrabold text-2xl tracking-tight">Parties</Text>
            </View>

            <View className="flex-row gap-3">
                <Button className="flex-1" asChild onPress={() => router.push("/(app)/(parties)/create")}>
                    <Plus size={16} color="#000000" strokeWidth={2.5} />
                    <Text className="font-jakarta-bold text-sm">Create Party</Text>
                </Button>

                <Button className="flex-1" variant="outline" asChild onPress={() => router.push("/(app)/(parties)/join")}>
                    <UserPlus size={16} color="#000000" strokeWidth={2.5} />
                    <Text className="font-jakarta-bold text-sm">Join Party</Text>
                </Button>
            </View>

            <View className="gap-3">
                <Text className="font-jakarta-extrabold text-lg tracking-tight">My Parties</Text>

                {parties.length === 0 ? (
                    <EmptyState icon={Users} title="No parties yet" description="Create a party or join one to start questing with friends." />
                ) : (
                    <View className="gap-3">
                        {parties.map((party) => (
                            <PartyCard key={party.id} party={party} memberCount={party._count.members} onPress={() => router.push(`/(app)/(parties)/${party.code}`)} />
                        ))}
                    </View>
                )}
            </View>

            <View className="gap-3">
                <View className="flex-row items-center gap-2">
                    <Compass size={18} color={color.foreground} strokeWidth={2.5} />
                    <Text className="font-jakarta-extrabold text-lg tracking-tight">Discover Parties</Text>
                </View>

                <View className="justify-center">
                    <View className="absolute left-3.5 z-10">
                        <Search size={18} color="#888" strokeWidth={2.5} />
                    </View>
                    <Input placeholder="Search parties by name or code..." value={search} onChangeText={setSearch} autoCapitalize="none" autoCorrect={false} className="pl-11" />
                </View>

                {discovering ? (
                    <SkeletonPartyList count={3} />
                ) : discoverParties.length === 0 ? (
                    <EmptyState icon={Compass} title={search ? "No parties found" : "No other parties"} description={search ? "Try a different name or code." : "There are no other parties to discover right now."} />
                ) : (
                    <View className="gap-3">
                        {discoverParties.map((party, index) => (
                            <PartyCard key={party.id} party={party} memberCount={party._count.members} onPress={() => router.push(`/(app)/(parties)/${party.code}`)} />
                        ))}
                    </View>
                )}
            </View>
        </Screen>
    );
}
