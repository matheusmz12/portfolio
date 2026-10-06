import { useRef } from "react";
import { FiArrowUp } from "react-icons/fi";
import { ScrollTrigger, useGSAP } from "../lib/gsap";

const RADIUS = 21;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Botão "voltar ao topo": aparece depois do hero e o anel mostra o progresso da rolagem.
// É um link para #inicio, então a rolagem suave fica por conta do Lenis.
function BackToTop() {
  const ref = useRef(null);

  useGSAP(() => {
    const button = ref.current;
    const ring = button.querySelector(".back-to-top-progress");

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - self.progress);
        button.classList.toggle("is-visible", self.scroll() > window.innerHeight * 0.8);
      },
    });
  });

  return (
    <a href="#inicio" className="back-to-top" ref={ref} aria-label="Voltar ao início da página">
      <svg className="back-to-top-ring" viewBox="0 0 48 48" aria-hidden="true">
        <circle className="back-to-top-track" cx="24" cy="24" r={RADIUS} />
        <circle
          className="back-to-top-progress"
          cx="24"
          cy="24"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <FiArrowUp className="back-to-top-arrow" aria-hidden="true" />
    </a>
  );
}

export default BackToTop;
