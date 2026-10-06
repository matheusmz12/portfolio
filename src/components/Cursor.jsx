import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap";

const INTERACTIVE = "a, button, input, textarea, label, .tech-card";

// Anel azul que segue o mouse. Só existe em computador (mouse/trackpad).
function Cursor() {
  const ringRef = useRef(null);
  const [enabled] = useState(
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion()
  );

  useEffect(() => {
    if (!enabled) return;
    const ring = ringRef.current;
    const xTo = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });

    const onMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
      ring.classList.add("is-visible");
    };
    const onOver = (e) => {
      ring.classList.toggle("is-hover", Boolean(e.target.closest(INTERACTIVE)));
    };
    const onLeave = () => ring.classList.remove("is-visible");
    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div className="cursor-ring" ref={ringRef} aria-hidden="true" />;
}

export default Cursor;
