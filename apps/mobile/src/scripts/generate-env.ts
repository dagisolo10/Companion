import fs from "fs";
import os from "os";
import path from "path";

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const wifi = interfaces["wlp0s20f3"];

    if (!wifi) return "127.0.0.1";

    for (const { family, address } of wifi) {
        if (family === "IPv4") {
            return address;
        }
    }
    return "127.0.0.1";
}

const localIP = getLocalIP();
console.log(`📡 Detected local IP address: ${localIP}`);

// Define the environment variables you want to generate
const envContent = `
# Auto-generated based on current network configuration
EXPO_PUBLIC_SERVER_URL=http://${localIP}:3000
EXPO_PUBLIC_SUPABASE_URL=http://${localIP}:54321
`;

fs.writeFileSync(path.join(__dirname, "../../.env.local"), envContent.trim());
console.log(envContent);
console.log("✅ Updated .env with the new local IP base URLs.");
