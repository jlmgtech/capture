import ShowPlugin from "./show-plugin";

export default class AnimStart extends ShowPlugin {

    constructor(slot) {
        super(slot);
    }

    async onShow(opts) {
        console.log("starting enter animation");
        const enter = opts?.enter ?? (async function(){});
        await enter(this.slot.el());
    }

    async onCaptureShow(_opts, prm) {
        // remember this promise because we need to wait
        // for the animation to finish before the app moves on.
        this.showPromise = prm;
    }

    async onCaptureResolve(_opts) {
        // prevent anything from moving forward until the animation is done:
        await this.showPromise;
    }

};
