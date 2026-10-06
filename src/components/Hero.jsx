import { useRef } from "react";
import "../styles/hero.css";
import { gsap, SplitText, useGSAP, prefersReducedMotion, createScramble } from "../lib/gsap";

import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

function Hero() {
  const heroRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const split = SplitText.create(".hero-title", { type: "chars", mask: "chars" });

      // Entrada: label decodifica, nome sobe letra a letra, depois o resto em cascata
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .add(createScramble(heroRef.current.querySelector(".hero-label")).play(0.7), 0.1)
        .from(split.chars, { yPercent: 110, duration: 1, stagger: 0.03 }, 0.15)
        .from(
          [".hero-subtitle", ".hero-description", ".hero-buttons", ".hero-socials"],
          { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.08 },
          0.55
        )
        .from(".scroll-hint", { autoAlpha: 0, duration: 1 }, 1.2);

      // Ao rolar, o texto sobe um pouco mais rápido (parallax)
      gsap.to(".hero-content", {
        yPercent: -12,
        autoAlpha: 0.2,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom 35%", scrub: true },
      });

      // Botões "magnéticos" (só com mouse)
      if (window.matchMedia("(hover: hover)").matches) {
        gsap.utils.toArray(".btn").forEach((btn) => {
          const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
          const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });

          btn.addEventListener("pointermove", (e) => {
            const r = btn.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * 0.25);
            yTo((e.clientY - r.top - r.height / 2) * 0.35);
          });
          btn.addEventListener("pointerleave", () => {
            xTo(0);
            yTo(0);
          });
        });
      }
    },
    { scope: heroRef }
  );

  return (
    <section className="hero" id="inicio" ref={heroRef}>
      <div className="hero-container">
        <div className="hero-content">
          <p className="section-label hero-label">Olá, eu sou</p>
          <h1 className="hero-title">
            MATHEUS <span>MUNIZ</span>
          </h1>
          <p className="hero-subtitle">
            Desenvolvedor Full Stack em formação
          </p>
          <p className="hero-description">
            Transformando ideias em aplicações web, com foco em aprendizado e
            soluções reais.
          </p>

          <div className="hero-buttons">
            <a href="#projetos" className="btn btn-primary">
              Ver meus projetos
            </a>
            <a href="#contato" className="btn btn-ghost">
              Entrar em contato
            </a>
          </div>

          <div className="hero-socials">
            <a href="https://github.com/matheusmz12" target="_blank" rel="noreferrer" aria-label="GitHub">
              <FaGithub />
            </a>

            <a href="https://www.linkedin.com/in/matheus-muniz-920036429" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>

            <a href="https://www.instagram.com/matheusmz12" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Âncora da esfera de partículas (ParticleBackground) */}
        <div className="hero-visual" data-shape="sphere" aria-hidden="true" />
      </div>

      <a href="#sobre" className="scroll-hint" aria-label="Rolar para a próxima seção">
        <span />
      </a>
    </section>
  );
}

export default Hero;
