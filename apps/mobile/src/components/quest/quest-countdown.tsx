import Text from "@/components/ui/text";
import { useEffect, useState } from "react";

type QuestCountdownProps = {
    target: string;
    reachedLabel: string;
};

export default function QuestCountdown({ target, reachedLabel }: QuestCountdownProps) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const remaining = Math.max(0, new Date(target).getTime() - now);
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86_400);
    const hours = Math.floor((totalSeconds % 86_400) / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    const seconds = totalSeconds % 60;

    const timeLeft =
        days > 0
            ? `${days}d ${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
            : hours > 0
              ? `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
              : `${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;

    return <Text className="font-jakarta-jakarta-extrabold text-foreground text-sm tabular-nums">{remaining > 0 ? timeLeft : reachedLabel}</Text>;
}
