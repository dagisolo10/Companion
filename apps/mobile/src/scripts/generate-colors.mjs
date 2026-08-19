import Color from "colorjs.io";
import fs from "fs";
import path from "path";
import postcss from "postcss";

const CSS_FILE_PATH = path.resolve("../mobile/src/app/global.css");
const OUTPUT_FILE_PATH = path.resolve("../mobile/src/constants/colors.ts");

function formatColor(cssString) {
    try {
        const color = new Color(cssString.trim());
        if (color.alpha < 1) {
            const [r, g, b] = color.to("srgb").coords.map((c) => Math.round(c * 255));
            return `rgba(${r}, ${g}, ${b}, ${Number(color.alpha.toFixed(2))})`;
        }
        return color.to("srgb").toString({ format: "hex" });
    } catch (e) {
        console.error("formatting color error", e);
        return cssString.trim();
    }
}

function kebabToCamel(str) {
    return str.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

async function generateColors() {
    const css = fs.readFileSync(CSS_FILE_PATH, "utf8");
    const rootNode = postcss.parse(css);

    const rawDark = {};
    const rawLight = {};

    rootNode.walk((node) => {
        // Top-level :root (Default / Dark mode)
        if (node.type === "rule" && node.selector === ":root" && node.parent.type === "root") {
            node.walkDecls(/^--/, (decl) => (rawLight[decl.prop.replace(/^--/, "")] = decl.value));
        }

        // Light mode inside @media (prefers-color-scheme: light)
        if (node.type === "atrule" && node.name === "media" && node.params.includes("dark")) {
            node.walkDecls(/^--/, (decl) => (rawDark[decl.prop.replace(/^--/, "")] = decl.value));
        }
    });

    const processVariables = (sourceObj) => {
        const result = {};
        for (const [key, rawValue] of Object.entries(sourceObj)) {
            if (key === "radius") continue;
            result[kebabToCamel(key)] = formatColor(rawValue);
        }
        return result;
    };

    const lightColors = processVariables(rawLight);

    const darkColors = processVariables({ ...rawLight, ...rawDark });

    const fileContent = `// Automatically generated from global.css. Do not edit directly.
export const Colors = ${JSON.stringify({ dark: darkColors, light: lightColors }, null, 4)} as const;
`;

    fs.writeFileSync(OUTPUT_FILE_PATH, fileContent, "utf8");
    console.log("✅ Successfully updated constants/Colors.ts with distinct Light/Dark themes!");
}

generateColors();
