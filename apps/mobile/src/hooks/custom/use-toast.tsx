import Toast, { ToastProps } from "@/components/common/toast";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react";


type ToastMessage = Omit<ToastProps, "onDismiss">;
type ShowToastOptions = ToastMessage & { durationMs?: number };
type ToastContextValue = { showToast: (options: ShowToastOptions) => void; dismissToast: () => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
    const [message, setMessage] = useState<ToastMessage | null>(null);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const dismissToast = useCallback(() => {
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = null;
        setMessage(null);
    }, []);

    const showToast = useCallback(({ durationMs = 4000, ...nextMessage }: ShowToastOptions) => {
        if (timeout.current) clearTimeout(timeout.current);
        setMessage(nextMessage);
        timeout.current = setTimeout(() => {
            timeout.current = null;
            setMessage(null);
        }, durationMs);
    }, []);

    useEffect(() => () => {
        if (timeout.current) clearTimeout(timeout.current);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, dismissToast }}>
            {children}
            {message ? <Toast {...message} onDismiss={dismissToast} /> : null}
        </ToastContext.Provider>
    );
}

export default function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}
