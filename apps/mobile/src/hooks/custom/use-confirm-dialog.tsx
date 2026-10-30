import ConfirmDialog from "@/components/common/confirm-dialog";
import { useCallback, useState } from "react";

type DialogOptions = {
    title: string;
    description: string;
    cancelLabel?: string;
    confirmLabel?: string;
    destructive?: boolean;
    onConfirm?: () => void;
};

export default function useConfirmDialog() {
    const [options, setOptions] = useState<DialogOptions | null>(null);
    const dismiss = useCallback(() => setOptions(null), []);
    const show = useCallback((next: DialogOptions) => setOptions(next), []);

    const onConfirm = useCallback(() => {
        const action = options?.onConfirm;
        dismiss();
        action?.();
    }, [dismiss, options]);

    const dialog = (
        <ConfirmDialog
            onCancel={dismiss}
            onConfirm={onConfirm}
            visible={options !== null}
            title={options?.title ?? ""}
            destructive={options?.destructive}
            description={options?.description ?? ""}
            confirmLabel={options?.confirmLabel ?? "OK"}
            cancelLabel={options?.cancelLabel ?? "Close"}
        />
    );

    return { showConfirmDialog: show, confirmDialog: dialog, dismissConfirmDialog: dismiss };
}
