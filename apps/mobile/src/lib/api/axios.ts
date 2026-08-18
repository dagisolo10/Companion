import { create } from "axios";

const baseURL = "http://10.128.192.56:3000";

export const api = create({ baseURL, withCredentials: true });

let tokenResolver: (() => string | null) | null = null;
export const injectTokenResolver = (resolver: () => string | null) => (tokenResolver = resolver);

api.interceptors.request.use((config) => {
    if (tokenResolver) {
        const token = tokenResolver();

        if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
        }
    }

    return config;
});
