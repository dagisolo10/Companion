import Button from "./ui/button";
import Text from "./ui/text";

import { useColor } from "@/hooks/custom/use-color";
import { api } from "@/lib/api/axios";
import { requestApi } from "@/lib/api/request-api";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, View } from "react-native";

export default function ApiTest() {
    const color = useColor();

    const { data, refetch, isFetching } = useQuery({
        enabled: false,
        queryKey: ["api-test"],
        queryFn: async () => requestApi(() => api.get<{ text: string; timestamp: string }>("/app/hello")),
    });

    return (
        <View className="items-center justify-center gap-4">
            {data ? (
                <>
                    <Text className="text-center text-xl font-bold">Text: {data?.text}</Text>
                    <Text className="text-center text-xl font-bold">Timestamp: {data?.timestamp}</Text>
                </>
            ) : (
                <>
                    <Text className="text-center text-xl font-bold">Waiting for fetch</Text>
                </>
            )}
            <Button onPress={() => refetch()}>{isFetching ? <ActivityIndicator color={color.black} /> : "Fetch"}</Button>
        </View>
    );
}
