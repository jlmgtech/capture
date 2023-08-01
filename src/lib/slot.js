import Capture from "./plugins/capture.js";
import Dispatcher from "./plugins/dispatcher.js";
import AnimStart from "./plugins/anim-start.js";
import AnimEnd from "./plugins/anim-end.js";

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
            new AnimEnd(this),
            new AnimStart(this),
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

    async leave() {
        // called if the DOM element is removed OR if the slot capture is resolved.
        delete reserved_ids[this.id];
        await this.plugins_call("onLeave");
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
                await this.plugins_call("onCaptureResolve", opts??{}, {detail:value});
                resolve(value);
                await this.leave();
            };
        });
    }

    toString() {
        return this.id;
    }
}
