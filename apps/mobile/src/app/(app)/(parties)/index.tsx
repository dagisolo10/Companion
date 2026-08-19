import Screen from "@/components/ui/screen";
import Text from "@/components/ui/text";
import { Link } from "expo-router";

export default function Parties() {
    return (
        <Screen className="items-center justify-center">
            <Link href={"/[code]"}>
                <Text className="text-center text-6xl font-extrabold">Parties</Text>
            </Link>
        </Screen>
    );
}
