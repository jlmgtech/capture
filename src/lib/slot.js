const returners = {};
window.returners = returners;
window.yeet = (slotId, ...args) => {
    if (typeof slotId !== "string") {
        throw new Error("yeet() must be called with a slot ID, received: "+slotId);
    }
    const payload = {};
    getPayload(payload, document.getElementById(slotId));
    if (payload.args) {
        console.warn("yeet() called with a slot ID that has an input named 'args', this will be overwritten by the arguments passed to yeet().");
    }
    payload.args = args;
    returners[slotId](payload);
};

const reserved_ids = {};
let lastID = 0;


function easeOutQuad(t) {
    return t * (2 - t);
}
function easeInQuad(t) {
    return t * t;
}
export function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
export async function tween(duration, interpolationFunc, callback) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const end = start + duration;
        function performUpdate() {
            try {
                if (Date.now() < end) {
                    const progress = (Date.now() - start) / duration;
                    callback(interpolationFunc(progress));
                    requestAnimationFrame(performUpdate);
                } else {
                    const progress = (Date.now() - start) / duration;
                    callback(1);
                    resolve();
                }
            } catch (e) {
                reject(e);
            }
        }
        performUpdate();
    });
}

export function init(rootID, entrypoint) {
    const el = document.getElementById(rootID);

    const cleanupObserver = new MutationObserver((_mutations, _observer) => {
        for (const id of Object.keys(reserved_ids)) {
            if (document.getElementById(id) === null) {
                reserved_ids[id].destroy();
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

const listeners = {};
window.listeners = listeners;
export function dispatch(event, ...args) {
    const cbs = listeners[event];
    if (cbs) {
        for (const listener of cbs) {
            listener(...args);
        }
    }
}

export class Slot {
    constructor(id) {
        this.id = id ?? `slot_${lastID++}`;
        if (reserved_ids[this.id]) {
            throw new Error("Slot ID already in use: "+this.id);
        }
        reserved_ids[this.id] = this;
        this.listeners = {};
    }

    destroy() {
        // called if the DOM element is removed OR if the slot capture is resolved.
        returners[this.id] = null;
        delete returners[this.id];
        delete reserved_ids[this.id];
        for (const [topic, callbacks] of Object.entries(this.listeners)) {
            listeners[topic] = listeners[topic].filter((cb) => !callbacks.includes(cb));
        }
        this.listeners = {};
    }

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
        // first, run the "leave" function on the current slot:
        if (typeof this._customLeave === "function") {
            await this._customLeave(this.el());
        }
        this.el().innerHTML = html;
        this._customLeave = opts?.leave ?? (async function() {});
        return new Promise((resolve) => {
            const enter = opts?.enter ?? (async function(){});
            enter(this.el()).then(() => {
                resolve();
            });
        });
    }

    capture(html, opts) {
        return new Promise((resolve, _reject) => {
            const beforePayload = {};
            getPayload(beforePayload, this.el());
            const startAnimationDelay = this.show(html, opts);
            //this.el().innerHTML = html;
            if (opts?.clear !== true) {
                // preserve the inputs that contribute to the payload:
                applyPayload(beforePayload, this.el());
            }
            returners[this.id] = async (value) => {
                // wait AT LEAST as long as the intro animation before resolving the promise:
                const onYeet = opts?.onYeet ?? (async (_, val) => val);
                await startAnimationDelay;
                const newval = await onYeet(this.el(), value);
                resolve(newval);
                this.destroy();
            };
        });
    }

    toString() {
        return this.id;
    }
}

function getPayload(payload, el) {
    if (el.name) {
        if (typeof payload[el.name] === "undefined") {
            payload[el.name] = el.value;
        } else {
            if (Array.isArray(payload[el.name])) {
                payload[el.name].push(el.value);
            } else {
                payload[el.name] = [payload[el.name], el.value];
            }
        }
    }
    for (const child of el.children) getPayload(payload, child);
}

function applyPayload(beforePayload, el) {
    for (const [k, v] of Object.entries(beforePayload)) {
        if (Array.isArray(v)) {
            const elements = el.querySelectorAll("[name='"+k+"']");
            for (let i = 0; i < v.length; i++) {
                if (i >= elements.length) break;
                elements[i].value = v[i];
            }
        } else {
            el.querySelector("[name='"+k+"']").value = v;
        }
    }
}

export const delay = ms => new Promise((resolve) => setTimeout(resolve, ms));
