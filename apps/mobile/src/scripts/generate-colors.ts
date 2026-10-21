import Color from "colorjs.io";
import fs from "node:fs";
import path from "node:path";
import postcss, { type Root } from "postcss";

const CSS_FILE_PATH = path.resolve("../mobile/src/app/global.css");
const OUTPUT_FILE_PATH = path.resolve("../mobile/src/constants/colors.ts");

type ColorMap = Record<string, string>;

function formatColor(cssString: string): string {
    try {
        const color = new Color(cssString.trim());

        if (color.alpha < 1) {
            const [r, g, b] = color.to("srgb").coords.map((c) => Math.round((c ?? 0) * 255));

            return `rgba(${r}, ${g}, ${b}, ${Number(color.alpha.toFixed(2))})`;
        }

        return color.to("srgb").toString({ format: "hex" });
    } catch (error: unknown) {
        console.error("Formatting color error:", error);
        return cssString.trim();
    }
}

function kebabToCamel(str: string): string {
    return str.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
}

function processVariables(source: ColorMap): ColorMap {
    const result: ColorMap = {};

    for (const [key, rawValue] of Object.entries(source)) {
        if (key === "radius") continue;

        result[kebabToCamel(key)] = formatColor(rawValue);
    }

    return result;
}

function generateColors(): void {
    const css = fs.readFileSync(CSS_FILE_PATH, "utf8");
    const root: Root = postcss.parse(css);

    const rawDark: ColorMap = {};
    const rawLight: ColorMap = {};

    root.walk((node) => {
        // Top-level :root (default/light theme)
        if (node.type === "rule" && node.selector === ":root" && node.parent?.type === "root") {
            node.walkDecls(/^--/, (decl) => {
                rawLight[decl.prop.replace(/^--/, "")] = decl.value;
            });
        }

        // Dark theme inside @media (prefers-color-scheme: dark)
        if (node.type === "atrule" && node.name === "media" && node.params.includes("dark")) {
            node.walkDecls(/^--/, (decl) => {
                rawDark[decl.prop.replace(/^--/, "")] = decl.value;
            });
        }
    });

    const lightColors = processVariables(rawLight);

    const darkColors = processVariables({
        ...rawLight,
        ...rawDark,
    });

    const fileContent = `// Automatically generated from global.css. Do not edit directly.
export const Colors = ${JSON.stringify({ dark: darkColors, light: lightColors }, null, 4)} as const;
`;

    fs.writeFileSync(OUTPUT_FILE_PATH, fileContent, "utf8");

    console.log("✅ Successfully updated constants/colors.ts with distinct light/dark themes!");
}

generateColors();
