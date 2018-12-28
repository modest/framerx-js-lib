// const performance = window.performance || {
//   offset: Date.now(),
//   now: () => Date.now() - this.offset
// };

const _raf = (f: FrameRequestCallback) => {
    setTimeout(f, 1 / 60)
}
const __raf = window.requestAnimationFrame || _raf

export const raf = (f: Function) => __raf(f as FrameRequestCallback)
