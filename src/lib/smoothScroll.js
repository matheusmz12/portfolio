import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

// Rolagem suave (Lenis) sincronizada com o relógio do GSAP/ScrollTrigger
export function initSmoothScroll() {
  if (prefersReducedMotion()) return () => {};

  const lenis = new Lenis({
    lerp: 0.1,
    // Deixa o trackpad rolar de lado dentro do carrossel de projetos
    allowNestedScroll: true,
    // Links "#secao" passam pelo Lenis, descontando o header fixo
    anchors: { offset: -70 },
  });

  lenis.on("scroll", ScrollTrigger.update);

  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
}
