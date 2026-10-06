import "../styles/header.css";
import { FaGithub } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "../lib/gsap";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const menuOpenRef = useRef(false);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  // Some ao rolar para baixo, volta ao rolar para cima
  useGSAP(() => {
    const hide = gsap.to(headerRef.current, {
      yPercent: -100,
      duration: prefersReducedMotion() ? 0 : 0.35,
      ease: "power2.out",
      paused: true,
    });

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (menuOpenRef.current) return;
        if (self.direction === 1 && self.scroll() > 160) hide.play();
        else if (self.direction === -1) hide.reverse();
      },
    });

    // Se o foco do teclado entrar no header escondido, ele reaparece
    headerRef.current.addEventListener("focusin", () => hide.reverse());
  });

  return (
    <header className="header" ref={headerRef}>
      <div className="header-container">
        <a href="#inicio" className="logo" aria-label="Matheus.dev — voltar ao início">
          MATHEUS<span>.DEV</span>
        </a>

        <nav id="menu" className={`nav ${menuOpen ? "open" : ""}`}>
          <a href="#inicio" onClick={closeMenu}>Início</a>
          <a href="#sobre" onClick={closeMenu}>Sobre</a>
          <a href="#projetos" onClick={closeMenu}>Projetos</a>
          <a href="#contato" onClick={closeMenu}>Contato</a>
        </nav>

        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="menu"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className="header-git">
          <a href="https://github.com/matheusmz12" target="_blank" rel="noreferrer">
            <FaGithub /> <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
