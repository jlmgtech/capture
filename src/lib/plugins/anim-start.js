import ShowPlugin from "./show-plugin";

export default class AnimStart extends ShowPlugin {

    constructor(slot) {
        super(slot);
    }

    async onShow(opts) {
        // anim:
        const enter = opts?.enter ?? (async function(){});
        await enter(this.slot.el());
    }

    async onCaptureShow(_opts, prm) {
        this.showPromise = prm;
    }

    async onCaptureResolve(_opts) {
        // anim:
        await this.showPromise;
    }

};
