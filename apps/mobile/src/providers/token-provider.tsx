import { useAuth } from "@/contexts/auth-context";
import { injectTokenResolver } from "@/lib/api/axios";
import { PropsWithChildren, useEffect } from "react";

export default function TokenProvider({ children }: PropsWithChildren) {
    const { token } = useAuth();

    useEffect(() => {
        injectTokenResolver(() => token);
    }, [token]);

    return <>{children}</>;
}
