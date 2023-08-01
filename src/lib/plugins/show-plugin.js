export default class ShowPlugin {

    constructor(slot) {
        this.slot = slot;
    }

    async onCreate() { }
    async onLeave() { }
    async onBeforeShow(opts) { }
    async onShow(opts) { }
    async onCaptureBeforeShow(opts, prm) { }
    async onCaptureShow(opts, prm) { }
    async onCaptureResolve(opts) { }
};
