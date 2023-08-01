import ShowPlugin from "./show-plugin";

const returners = {};
window.returners = returners;

function lockyeet(slotid) {
    if (typeof slotid === "string" && slotid) {
        yeetlocks[slotid] = yeetlocks[slotid] ?? 0;
        yeetlocks[slotid]++;
    }
}

function unlockyeet(slotid) {
    if (typeof slotid === "string" && slotid) {
        yeetlocks[slotid] = yeetlocks[slotid] ?? 0;
        yeetlocks[slotid] = Math.max(0, yeetlocks[slotid]-1);
    }
}

const yeetlocks = {};
window.yeet = async (slotId, ...args) => {
    if (typeof slotId !== "string") {
        throw new Error("yeet() must be called with a slot ID, received: "+slotId);
    }
    if (yeetlocks[slotId] > 0) {
        return;
    }
    lockyeet(slotId);
    try {
        const payload = {};
        getPayload(payload, document.getElementById(slotId));
        if (payload.args) {
            console.warn("yeet() called with a slot ID that has an input named 'args', this will be overwritten by the arguments passed to yeet().");
        }
        payload.args = args;
        await returners[slotId](payload);
        return;
    } catch(e) {
        throw e;
    } finally {
        unlockyeet(slotId);
    }
};

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

export default class Capture extends ShowPlugin {

    constructor(slot) {
        super(slot);
    }

    async onNeedYeetLock(callback) {
        lockyeet(this.slot.id);
        try {
            await callback();
        } finally {
            unlockyeet(this.slot.id);
        }
    }

    async onLeave() {
        returners[this.slot.id] = null;
        delete returners[this.slot.id];
    }

    async onCaptureBeforeShow(_opts) {
        this.beforePayload = {};
        getPayload(this.beforePayload, this.slot.el());
    }

    async onCaptureShow(opts) {
        if (opts?.clear !== true) {
            // preserve the inputs that contribute to the payload:
            applyPayload(this.beforePayload, this.slot.el());
        }
    }

};
