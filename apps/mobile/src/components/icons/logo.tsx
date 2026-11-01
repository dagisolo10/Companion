import Svg, { Path, Rect } from "react-native-svg";

type CompanionIconProps = {
    size?: number;
    left?: string;
    right?: string;
    color?: string;
    center?: string;
    fillColor?: string;
};

export default function CompanionIcon({ size = 100, color = "#008cff", left = "#A3E635", right = "#FBBF24", center = "#FFFFFF", fillColor = "#000000" }: CompanionIconProps) {
    return (
        <Svg fill="none" width={size} height={size} viewBox="0 0 512 512">
            <Rect width="512" height="512" fill={fillColor} stroke={color} strokeWidth="0" />
            <Path d="M116 116H236V216H176V296H236V396H116V116Z" fill={left} strokeLinejoin="round" />
            <Path d="M396 116H276V216H336V296H276V396H396V116Z" fill={right} strokeLinejoin="round" />
            <Rect x="226" y="226" width="60" height="60" fill={center} stroke={color} strokeWidth="0" />
        </Svg>
    );
}
