import {Slot, init, delay, dispatch} from "./lib/slot";

const tools = [
    {name: "folders", icon: "📁"},
    {name: "manage users", icon: "👤"},
    {name: "folder access", icon: "🔒"},
    {name: "permissions", icon: "🔑"},
    {name: "api", icon: "📡"},
    {name: "PHP Errors", icon: "🐘"},
    {name: "Virtual Assistant", icon: "🤖"},
    {name: "Signup Wizard", icon: "🧙"},
    {name: "Logout", icon: "🚪"},
];

async function main(slot) {
    const layout = new Slot("menu");
    const app = new Slot("app");
    slot.show(`
        <br />
        <h1 style="text-align:center">Admin Panel</h1>
        <hr />
        <div style="display:flex;">
            <div id="menu">please wait</div>
            <div id="app"></div>
        </div>
    `);
    showMenu(layout);
    showApp(app);
}

async function showApp(slot) {
    //initApps(slot);
    slot.show(`<div style="margin:1em">select a tool</div>`);
    slot.on("menuClick", async (name) => {
        slot.show(`<div style="margin:1em">${name}</div>`);
    });
}

async function showMenu(layout) {
    for (;;) {
        const {args: [name]} = await layout.capture(`
            <ul style="list-style:none">
                ${tools.map((tool) => `
                    <li style="margin:1em;cursor:pointer;" onclick="yeet('${layout}', '${tool.name}')">${tool.icon} ${tool.name}</li>
                `).join("")}
            </ul>
        `);
        dispatch("menuClick", name);
    }
}

init("root", main);
