import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function AppTabsLayout() {
    return (
        <NativeTabs>
            <NativeTabs.Trigger name="(home)">
                <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="house.fill" />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="(parties)">
                <NativeTabs.Trigger.Label>Parties</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="person.3.fill" />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="(leaderboard)">
                <NativeTabs.Trigger.Label>Ranks</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="globe" />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="(search)" role="search">
                <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="(profile)">
                <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="person.crop.circle.fill" />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
