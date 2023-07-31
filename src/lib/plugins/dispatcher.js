import ShowPlugin from "./show-plugin";

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

export default class Dispatcher extends ShowPlugin {
    constructor(slot) {
        super(slot);
    }

    async onCreate() {
        // dispatcher:
        this.listeners = {};
    }
    async onLeave() {
        // dispatcher:
        for (const [topic, callbacks] of Object.entries(this.listeners)) {
            listeners[topic] = listeners[topic].filter((cb) => !callbacks.includes(cb));
        }
        this.listeners = {};
    }
};
