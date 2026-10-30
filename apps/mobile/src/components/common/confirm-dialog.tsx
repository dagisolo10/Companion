import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import { Modal, View } from "react-native";

type ConfirmDialogProps = {
    title: string;
    visible: boolean;
    loading?: boolean;
    description: string;
    cancelLabel?: string;
    confirmLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDialog({ visible, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", destructive, onConfirm, onCancel, loading }: ConfirmDialogProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <View className="flex-1 items-center justify-center bg-black/50 px-8">
                <View className="border-foreground bg-card shadow-nb w-full gap-2 border-2 p-6">
                    <Text className="text-xl font-extrabold">{title}</Text>
                    <Text className="text-muted-foreground text-sm font-bold">{description}</Text>
                    <View className="mt-2 gap-3">
                        <Button variant={destructive ? "destructive" : "default"} onPress={onConfirm} disabled={loading}>
                            <Text>{confirmLabel}</Text>
                        </Button>
                        <Button variant="outline" onPress={onCancel} disabled={loading}>
                            <Text>{cancelLabel}</Text>
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
