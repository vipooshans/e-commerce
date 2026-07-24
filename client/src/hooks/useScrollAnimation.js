import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scrubbed scroll progress (0–1) for the hero pin section.
 * Mutates `progressRef.current` — safe to read inside R3F useFrame.
 */
export default function useScrollAnimation(sectionRef, progressRef, options = {}) {
  const { enabled = true, scrub = 1.1, end = '+=220%' } = options;

  useEffect(() => {
    if (!enabled || !sectionRef.current) {
      if (progressRef) progressRef.current = 0;
      return undefined;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end,
        scrub,
        onUpdate: (self) => {
          if (progressRef) progressRef.current = self.progress;
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [sectionRef, progressRef, enabled, scrub, end]);
}
