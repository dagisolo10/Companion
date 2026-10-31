import Button from "@/components/ui/button";
import Text from "@/components/ui/text";
import type { ChatMessage } from "@companion/shared-types";
import { Modal, View } from "react-native";

type MessageActionsDialogProps = {
    message: ChatMessage | null;
    onEdit: (message: ChatMessage) => void;
    onDelete: (message: ChatMessage) => void;
    onCancel: () => void;
};

export default function MessageActionsDialog({ message, onEdit, onDelete, onCancel }: MessageActionsDialogProps) {
    return (
        <Modal visible={message !== null} transparent animationType="fade" onRequestClose={onCancel}>
            <View className="flex-1 items-center justify-center bg-black/50 px-8">
                <View className="border-foreground bg-card shadow-nb w-full gap-2 border-2 p-6">
                    <Text className="font-jakarta-extrabold text-xl">Message options</Text>
                    <Text className="text-muted-foreground font-jakarta-bold text-sm" numberOfLines={3}>
                        {message?.content}
                    </Text>
                    <View className="mt-2 gap-3">
                        <Button onPress={() => message && onEdit(message)} disabled={!message}>
                            <Text>Edit</Text>
                        </Button>
                        <Button variant="destructive" onPress={() => message && onDelete(message)} disabled={!message}>
                            <Text>Delete</Text>
                        </Button>
                        <Button variant="outline" onPress={onCancel}>
                            <Text>Cancel</Text>
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
