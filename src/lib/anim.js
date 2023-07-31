export function easeOutQuad(t) {
    return t * (2 - t);
}
export function easeInQuad(t) {
    return t * t;
}
export function linear(t) {
    return t;
}
export function easeInCubic(t) {
    return t * t * t;
}
export function easeOutCubic(t) {
    return (--t) * t * t + 1;
}
export function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
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
export const delay = ms => new Promise((resolve) => setTimeout(resolve, ms));
