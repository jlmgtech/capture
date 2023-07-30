import {Slot, init, delay, dispatch} from "./lib/slot";


const preamble = `
extensible modularity:
* module platform must provide modules two key features:
    * subscribable events - so we can extend modules without modifying them.
    * callable methods - so we can share functionality across modules.

* the module platform undergoes the following phases at runtime:
    1. module discovery - this is how the system knows what modules are available.
    2. module initialization - at the minimum, this is when modules can register for events.
    4. module bootstrapping - This is how the first module runs, and serves as
    the entry point into the module system. Primary example: the host calls a
    single method on the entrypoint module. This is akin to how the main()
    function is the entry point into a C program. There's lots of functions in a C program, but only one main() function.

    The host platform should be as separated from the module platform as
    possible, and should be as self-hosted as possible. This way, the host
    platform does not need to provide a lot of functionality in order to adopt
    the module ecosystem. The aim is for the host to be a module itself (or to
    be represented by a module). This way, the host platform can be extended by
    other modules, and the host platform can be self-hosted. Consider System-V
    init, where the root process (PID 1) is a special process that is
    responsible for bootstrapping the system. This is a good example of a
    self-hosted platform. The management of all processes begins with PID 1.
    The loading of services happens in a configurable order determined by the
    root process. The root process is responsible for loading the services and
    ensuring reliability of the system.

* modularity principles

    *   you can write new features for your operating system without having to
        touch the operating system source code. This is the foundational
        principle behind modularity. (the "O" in SOLID)

    *   the module platform should be as separated from the host platform as
        possible.

    *   the module platform should be as self-hosted as possible. This means
        the amount of startup-specific code outside of a module should be
        minimal. The less code outside of a module, the better. The
        attainability of this goal will depend on the affordances provided by
        the host platform.

    *   Modules bindings should be separate from your logic. Your logic should
        provide extension points, but otherwise should not show any attachment
        to the module system. 

    *   modules should be as self-contained as possible (one module per
        directory). You shouldn't need to litter the filesystem to add a single
        feature.

    *   true modularity affords options like swappable modules, fallback
        modules, and multiple modules for the same feature. None of these are
        required and should be considered depending on the needs of your
        system.

    *   modular systems may allow modules to instance their own sub-ecosystems.
        An analog of this is the ability to spawn subprocesses in a
        process-based system.

Modular architectures are not new. They are the basis of the Unix philosophy.
The Unix philosophy is a set of principles that focus on the separation of
concerns. Examples of guiding principles in the Unix philosophy include:

*   "do one thing and do it well"
*   "write programs to work together"
*   "write programs to handle text streams, because that is a universal interface"

*   "design and build software, even operating systems, to be tried early, ideally within weeks. Don't hesitate to throw away the clumsy parts and rebuild them"
*   "seek out simplicity and avoid unnecessary complexity"
*   "use tools in preference to unskilled help to lighten a programming task, even if you have to detour to build the tools and expect to throw some of them out after you've finished using them"
*   "use tools that encourage freedom rather than "convenience"."
*   "use tools that are composable"
*   "use tools that are transparent"
*   "use tools that have a uniform interface"

Look to computer hardware for examples where modularity is used. Components on
a PCB cannot simply be "reprogrammed" to add a new feature. The components must
communicate with other, as-of-yet unknown other modules in order to be
extended. Because of this agnostic communication, components are replaceable and 
interchangeable. The composability allows endless configurations of those chips
on a breadboard to tackle new challenges. The facilitation of that
communication is what defines the modularity platform.

Module composability:
There's a few ways to compose modules. The most common way is to use a
dependency injection framework. An example of this is the Spring framework for
Java. Another way is to use a module system that allows you to import modules

`;


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

    for (;;) {
        let usr = "", pwd = "";
        let feedback = "";
        for (;;) {
            console.log("drawing ", Math.random());
            await slot.capture(`
                <div>${feedback}</div>
                ${input({type: "text", value:usr, placeholder: "user", onchange(val){usr=val}})}
                ${input({type: "text", value:pwd, placeholder: "password", onchange(val){pwd=val}})}
                <input type="submit" onclick="yeet('${slot}')" value="yeet" />
            `);

            feedback = "";
            if (!usr) {
                feedback += "<div>please enter a username</div>";
            }
            if (!pwd) {
                feedback += "<div>please enter a password</div>";
            }
            if (!feedback) {
                break;
            }
        }
        slot.show(`You entered '${usr}', '${pwd}'.`);
        await delay(1000);
        if (usr === "admin" && pwd === "admin") {
            break;
        }
    }
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

function input({type, placeholder, onchange, value}) {
    const slot = new Slot();
    Promise.resolve().then(async () => {
        for (;;) {
            const rsp = await slot.capture(`<input type="${type}" value="${value}" name='field' placeholder="${placeholder}" onchange="yeet('${slot}')" />`);
            onchange(rsp.field);
        }
    });
    return `<span id="${slot}"></span>`;
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
