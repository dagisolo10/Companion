import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { Modal, View } from "react-native";

type ConfirmDialogProps = {
    visible: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
};

export default function ConfirmDialog({ visible, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", destructive, onConfirm, onCancel, loading }: ConfirmDialogProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View className="flex-1 items-center justify-center bg-black/50 px-8">
                <View className="border-foreground bg-card shadow-nb w-full gap-4 rounded-2xl border-2 p-6">
                    <Text className="font-jakarta-extrabold text-xl">{title}</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-sm">{description}</Text>
                    <View className="gap-3">
                        <Button variant={destructive ? "destructive" : "default"} onPress={onConfirm} disabled={loading}>
                            {confirmLabel}
                        </Button>
                        <Button variant="ghost" onPress={onCancel} disabled={loading}>
                            {cancelLabel}
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
