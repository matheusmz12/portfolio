import { useEffect, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/gsap";

// Fundo 3D fixo atrás do site (estrelas + esfera). O Three.js é carregado sob demanda.
// A rolagem controla a forma: esfera → "</>" → "MM" (ver three/particleScene.js)
function ParticleBackground() {
  const ref = useRef(null);
  const state = useRef({ morph: 0, intro: prefersReducedMotion() ? 1 : 0 });

  useEffect(() => {
    let destroy;
    let cancelled = false;

    import("../three/particleScene").then(async ({ createParticleScene }) => {
      const cleanup = await createParticleScene(ref.current, state.current, {
        reducedMotion: prefersReducedMotion(),
      });
      if (cancelled) {
        cleanup();
        return;
      }
      destroy = cleanup;

      // Partículas espalhadas se juntam e formam a esfera
      gsap.to(state.current, { intro: 1, duration: 3, ease: "expo.out", delay: 0.2 });
    });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  useGSAP(() => {
    // Esfera → "</>" ao chegar em Tecnologias
    gsap.fromTo(
      state.current,
      { morph: 0 },
      {
        morph: 1,
        ease: "none",
        immediateRender: false,
        scrollTrigger: { trigger: '[data-shape="code"]', start: "top bottom", end: "center 55%", scrub: true },
      }
    );

    // "</>" → "MM" ao chegar em Contato
    gsap.fromTo(
      state.current,
      { morph: 1 },
      {
        morph: 2,
        ease: "none",
        immediateRender: false,
        scrollTrigger: { trigger: '[data-shape="mono"]', start: "top bottom", end: "center 55%", scrub: true },
      }
    );
  });

  return <div className="particle-bg" ref={ref} aria-hidden="true" />;
}

export default ParticleBackground;
