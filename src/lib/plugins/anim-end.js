import ShowPlugin from "./show-plugin";

export default class AnimEnd extends ShowPlugin {

    constructor(slot) {
        super(slot);
    }

    async onBeforeShow(opts) {
        // recall the leave from the previous "show" call:
        const leave = this._last_leave ?? (async function(){});
        // save this leave for the next "show" call:

        this._last_leave = opts?.leave ?? (async function(){});
        // run the leave animation:

        this.slot.plugins_call("onNeedYeetLock", () => leave(this.slot.el()));
    }

    async onCaptureResolve(opts, data) {
        const onYeet = opts?.onYeet ?? (async function(){});
        await onYeet(this.slot.el(), data);
    }

};
