import readline from "readline";
import { search } from "./services/searchService.js";

function ask(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

async function main() {
    console.log("🔍 Recipe Search Test\n");

    const query = await ask("Enter search query: ");
    const fieldInput = await ask("Search fields (comma-separated: title,tags,ingredients): ");

    const fields = fieldInput
        .split(",")
        .map(f => f.trim())
        .filter(Boolean);

    console.log("\n⏳ Searching...\n");

    const results = await search(query, fields);

    if (results.length === 0) {
        console.log("❌ No recipes found.");
        return;
    }

    console.log(`✅ Found ${results.length} recipe(s):\n`);

    results.forEach(r => {
        console.log(`- ${r.title}`);
    });
}

main().catch(err => {
    console.error("❌ Error:", err.message);
});