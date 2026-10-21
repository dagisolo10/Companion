import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function useRefetchOnFocus(refetch: () => unknown) {
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch]),
    );
}
