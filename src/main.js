import {Slot, init, delay, dispatch, tween, easeInOutQuad} from "./lib/slot";


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
        const contentSlot = new Slot();
        await slot.show(`
            <div id="${contentSlot}" style="width: 80%;margin:auto; padding-top:2em;"></div>
        `);
        const user = await loginForm(contentSlot);
        //const user = {usr: "admin", pwd: "admin"};

        const path = "/" + window.location.pathname.split("/").filter(Boolean).join("/");
        switch (path) {
            case "/thing":
                await thing(contentSlot, user);
                break;
            case "/test":
                await testTool(contentSlot, user);
                break;
            default:
                await appMenu(contentSlot, user);
                break;
        }
    }
}

async function thing(slot, user) {
    await slot.show("You've been routed to THING");
    await delay(1000);
    await appMenu(slot, user);
}

async function appMenu(contentSlot, user) {
    await contentSlot.show(`
        <div style="opacity:0"> Welcome, ${user.usr}. </div>
    `, {
        async enter(el) {
            const div = el.getElementsByTagName("div")[0];
            await tween(1000, easeInOutQuad, t => {
                div.style.opacity = t;
            });
        }
    });
    //await delay(1000);
    await contentSlot.show(`
        <div> Welcome, ${user.usr}. </div>
        <div style="opacity:0"> What would you like to do? </div>
    `, {
        async enter(el) {
            const div = el.getElementsByTagName("div")[1];
            await tween(1000, easeInOutQuad, t => {
                div.style.opacity = t;
            });
        }
    });
    //await delay(1000);
    const menuSlot = new Slot();
    await contentSlot.show(`
        <div> Welcome, ${user.usr}. </div>
        <div> What would you like to do? </div>
        <div id="${menuSlot}" style="display:flex; flex-wrap: wrap; justify-content: space-around;"></div>
    `);

    for (;;) {
        const chosenTool = await captureTool(menuSlot, user);
        await menuSlot.show(`you chose "${chosenTool}"`);
        await delay(1500);
        if (chosenTool === "Logout") {
            await menuSlot.show("goodbye!");
            await delay(1500);
            break;
        }
    }

}

async function testTool(slot, user) {
    for (;;) {
        const [_chosenTool] = await Promise.all([
            captureTool(slot, user),
            delay(500).then(() => window.yeet(slot.id, "folders")),
        ]);
    }
}

async function captureTool(slot, user) {
    const rsp = await slot.capture(`
        <div class="container">
            <div class="row text-center">
                ${tools.map(tool => `
                    <div
                        class="col-lg-2 col-md-3 col-sm-4 col-xs-6 tool ${tool.name.replace(" ", "-")}"
                        style="opacity:0;cursor:pointer;trasform: perspective(800px)" onclick="yeet('${slot}', '${tool.name}')">
                        <br />
                        <div style="font-size: 3em;">${tool.icon}</div>
                        <div>${tool.name}</div>
                        <br />
                    </div>
                `).join("")}
            </div>
        </div>
    `, {
        async onYeet(el, data) {
            const tname = data.args[0].replace(" ", "-");
            const tool = el.querySelector(".tool." + tname);
            const othertools = [...el.querySelectorAll(".tool")].filter(t => t !== tool);
            await Promise.all([
                // fade out all the other tools
                Promise.all(othertools.map(tool => tween(500, easeInOutQuad, t => {
                    tool.style.opacity = 1 - t;
                }))),
                    // make the clicked tool bigger
                tween(500, easeInOutQuad, t => {
                    tool.style.transform = `perspective(800px) translateZ(${1 + t * 300}px)`;
                }).then(() =>
                    // fade out the tool that was clicked
                    tween(1000, easeInOutQuad, t => {
                        tool.style.opacity = 1 - t;
                    })
                ),
            ]);
            return data;
        },
        async enter(el) {
            // animate all the tools in, one at a time, using the tween(ms, callback) function
            const tools = el.querySelectorAll(".tool");
            const prms = [];
            for (const tool of tools) {
                await delay(20);
                prms.push(tween(250, easeInOutQuad, (t) => {
                    tool.style.opacity = t;
                }));
            }
            await Promise.all(prms);
        },
        async leave(el) { },
    });
    return rsp.args[0];
}

async function loginForm(slot) {
    const loginSlot = new Slot("login");
    for (;;) {

        await slot.show(`
                <h1>XSF Login</h1>
                <hr />
                <div id="${loginSlot}"></div>
        `,
            {
                async enter(el) {
                    const time = 500;
                    const then = Date.now() + time;
                    while (Date.now() < then) {
                        el.style.opacity = 1 - ((then - Date.now()) / time);
                        await delay(0);
                    }
                }
            }
        );

        const usr = await inputForm(loginSlot, {placeholder: "username", type: "text"});
        const pwd = await inputForm(loginSlot, {placeholder: "password", type: "password"});
        await loginSlot.show(`please wait...`);
        await delay(1000);
        if (usr === "admin" && pwd === "admin") {
            return {usr, pwd};
        }
        await loginSlot.capture(`
            <div>invalid username or password <button class="btn btn-primary" onclick="yeet('${loginSlot}')">try again &uarr;</button></div>
        `);

    }
}

function input(opts) {
    const slot = new Slot();
    let fields = [];
    for (const [k, v] of Object.entries(opts)) {
        if (k === "onchange") continue;
        fields.push(`${k}="${v}"`);
    }
    Promise.resolve().then(async () => {
        for (;;) {
            const rsp = await slot.capture(`<input ${fields.join(" ")} name="field" onchange="yeet('${slot}')" />`, {clear:false});
            opts.onchange(rsp.field);
        }
    });
    return `<span id="${slot}"></span>`;
}

async function inputForm(slot, {placeholder, type}) {
    let feedback = "";
    for (;;) {

        // Animation is an action and a delay.
        // The action is a promise that resolves when the animation is complete.
        // Animations happen at transitions between calls to show/capture.
        // There's an exit and an enter animation for each call.
        // The exit animation can happen after a yeet or when another call overrides the contents of the current slot.
        // Exit animations add to the delay on the next call.
        // Animations do NOT happen if the capture/show call does not clear the slot first (clear=true).
        const rsp = await slot.capture(`
            <form onsubmit="return false; yeet('${slot}')">
                <div class="container">
                    <div class="row">
                        <div class="col-md-6">
                            <input class="form-control" type="${type}" value="" placeholder="${placeholder}" name="usr" />
                        </div>
                        <div class="col-md-6 col-sm-12 text-center">
                            <button class="btn btn-primary" onclick="yeet('${slot}')">next &rarr;</button>
                        </div>
                    </div>
                </div>
                <div style="color: #68ff00">${feedback}</div>
            </form>
        `, {
            async enter(el) {
                el.children[0].style.transform = "translateY(2em)";
                await tween(500, easeInOutQuad, (progress) => {
                    el.children[0].style.transform = `translateY(${(1 - progress) * 2}em)`;
                    el.children[0].style.opacity = progress;
                });
                el.querySelector("input").focus();
            },
            async leave(el) {
                await tween(500, easeInOutQuad, (progress) => {
                    el.children[0].style.transform = `translateY(${progress * 2}em)`;
                    el.children[0].style.opacity = 1 - progress;
                });
            },
        });
        feedback = "";


        console.log(rsp);
        rsp.usr = rsp.usr.trim();
        if (!rsp.usr) {
            feedback = `${placeholder} is required`;
            continue;
        }

        return rsp.usr;
    }
}

//// this is a crazy pattern. Returning a closure for each iteration:
//function countforever(output) {
//    let i = 0;
//    return function self() {
//        output[0] = ++i;
//        return self;
//    };
//}
//window.countforever = countforever;

init("root", main);
