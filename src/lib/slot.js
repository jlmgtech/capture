import Capture from "./plugins/capture.js";
import Dispatcher from "./plugins/dispatcher.js";

const reserved_ids = {};
export function init(rootID, entrypoint) {
    const el = document.getElementById(rootID);

    const cleanupObserver = new MutationObserver((_mutations, _observer) => {
        for (const id of Object.keys(reserved_ids)) {
            if (document.getElementById(id) === null) {
                reserved_ids[id].leave();
            }
        }
    });

    cleanupObserver.observe(el, {
        subtree: true,
        childList: true,
    });
    const slot = new Slot(rootID);
    entrypoint(slot);
    return slot;
}

let lastID = 0;
export class Slot {

    constructor(id) {
        this.id = id ?? `slot_${lastID++}`;
        if (reserved_ids[this.id]) {
            throw new Error("Slot ID already in use: "+this.id);
        }
        reserved_ids[this.id] = this;
        this.plugins = [
            new Capture(this),
            new Dispatcher(this),
        ];
        this.plugins_call("onCreate");
    }

    async plugins_call(func="", ...args) {
        for (const plugin of this.plugins) {
            if (typeof plugin[func] === "function") {
                await plugin[func](...args);
            }
        }
    }

    leave() {
        // called if the DOM element is removed OR if the slot capture is resolved.
        delete reserved_ids[this.id];
        this.plugins_call("onLeave");
    }

    // dispatcher: TODO - somehow put this in your plugin
    on(event, callback) {
        this.listeners[event] = this.listeners[event] ?? [];
        this.listeners[event].push(callback);
        listeners[event] = listeners[event] ?? [];
        listeners[event].push(callback);
    }

    el() {
        const el = document.getElementById(this.id);
        if (el === null) {
            throw new Error("Slot element not found in the DOM (#"+this.id+"), did you forget to bind it to a parent slot?");
        }
        return el;
    }

    async show(html, opts) {
        await this.plugins_call("onBeforeShow", opts??{});
        this.el().innerHTML = html;
        return await this.plugins_call("onShow", opts??{});
    }

    // capture: TODO - somehow put this in your plugin
    capture(html, opts) {
        return new Promise(async (resolve, _reject) => {
            await this.plugins_call("onCaptureBeforeShow", opts??{});
            const prm = this.show(html, opts);
            await this.plugins_call("onCaptureShow", opts??{}, prm);
            returners[this.id] = async (value) => {
                await this.plugins_call("onCaptureResolve", opts??{});
                // wait AT LEAST as long as the intro animation before resolving the promise:
                resolve(value);
                this.leave();
            };
        });
    }

    toString() {
        return this.id;
    }
}

let state = {};
const plugins = [
    {
        name: "animations",

        async onCreate(slot) {
            console.log("creating state for slot " + slot.id);
            if (state[slot.id]) {
                console.error("State already exists for slot "+slot.id);
            }
            state[slot.id] = {};


            // dispatcher:
            state[slot.id].listeners = {};
        },

        async onLeave(slot) {
            // TODO: this doesn't work with capture for some reason:
            console.log("removing state for slot "+slot.id);
            //delete state[slot.id];

            // capture:
            returners[slot.id] = null;
            delete returners[slot.id];

            // uniquify:
            delete reserved_ids[slot.id];

            // dispatcher:
            for (const [topic, callbacks] of Object.entries(state[slot.id].listeners)) {
                listeners[topic] = listeners[topic].filter((cb) => !callbacks.includes(cb));
            }
            state[slot.id].listeners = {};

        },

        async onBeforeShow(slot, opts) {
            state[slot.id] = state[slot.id] ?? {};
        },

        async onShow(slot, opts) {
            // anim:
            const enter = opts?.enter ?? (async function(){});
            await enter(slot.el());
        },

        async onCaptureBeforeShow(slot, opts) {
            // capture:
            state[slot.id].beforePayload = {};
            getPayload(state[slot.id].beforePayload, slot.el());
        },

        async onCaptureShow(slot, opts, prm) {
            //anim:
            state[slot.id].showPromise = prm;

            //capture:
            if (opts?.clear !== true) {
                // preserve the inputs that contribute to the payload:
                applyPayload(state[slot.id].beforePayload, slot.el());
            }
        },

        async onCaptureResolve(slot, opts) {
            // anim:
            await state[slot.id].showPromise;
        },

    },
];


