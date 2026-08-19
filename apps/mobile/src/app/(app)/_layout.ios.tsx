import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function IOSAppTabLayout() {
    return (
        <NativeTabs>
            <NativeTabs.Trigger name="index">
                <Label>Home</Label>
                <Icon sf={"house.fill"} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="(parties)">
                <Label>Parties</Label>
                <Icon sf={"person.3.fill"} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="profile">
                <Label>Profile</Label>
                <Icon sf="person.crop.circle.fill" />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="search">
                <Label>Search</Label>
                <Icon sf="gearshape" />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
