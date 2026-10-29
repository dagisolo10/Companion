import { NativeTabs } from "expo-router/native-tabs";

export default function AppTabsLayout() {
    return (
        <NativeTabs>
            <NativeTabs.Trigger name="(home)">
                <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="house.fill" />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="(profile)">
                <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="person.crop.circle.fill" />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="(search)" role="search">
                <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
