import Text from "./ui/text";

export default function ErrorMessage({ message }: { message?: string | null }) {
    if (!message) return null;
    return <Text className="text-destructive text-sm font-semibold">{message}</Text>;
}
