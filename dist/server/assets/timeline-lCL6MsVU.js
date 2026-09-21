import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
function createScrub(opts) {
  const st = ScrollTrigger.create({
    trigger: opts.trigger,
    start: "top top",
    end: opts.end,
    pin: opts.pin ?? true,
    scrub: opts.scrub ?? 0.6,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => opts.onProgress(self.progress)
  });
  return () => st.kill();
}
export {
  createScrub as c
};
