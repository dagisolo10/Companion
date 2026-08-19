import { create } from "axios";

const baseURL = "http://172.20.10.4:3000";

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
