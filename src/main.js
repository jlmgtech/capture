import {Slot, init, delay, dispatch, tween, easeInOutQuad} from "./lib/slot";

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
