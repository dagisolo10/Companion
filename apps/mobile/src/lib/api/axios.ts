import { create } from "axios";


const baseURL = process.env.EXPO_PUBLIC_SERVER_URL;

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
