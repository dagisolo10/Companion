import { useAudioPlayer } from "expo-audio";
import { useCallback } from "react";

const notificationSound = require("@assets/sounds/pop.mp3") as number;
// const notificationSound = require("@assets/sounds/chat-notification.wav") as number;

export default function useChatNotificationSound() {
    const player = useAudioPlayer(notificationSound);

    return useCallback(() => {
        void player
            .seekTo(0)
            .then(() => player.play())
            .catch(() => undefined);
    }, [player]);
}
