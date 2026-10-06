import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

gsap.defaults({ ease: "power3.out", duration: 0.7 });

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const GLYPHS = "!<>-_\\/[]{}=+*^?#%$&01";
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// Texto original de cada nó. Guardado fora do DOM para sobreviver quando o
// React monta o componente duas vezes (StrictMode/HMR) no meio do embaralhamento.
const originalText = new WeakMap();

/*
  Texto que "decodifica", como num terminal: os caracteres começam embaralhados
  e se resolvem da esquerda para a direita. Funciona com <span> dentro do texto
  (percorre cada nó de texto) e não mexe no layout porque a fonte é monoespaçada.

  Retorna um controle que pode tocar a animação quantas vezes quiser:
  scramble.play(duração?) → tween do GSAP
*/
export function createScramble(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    nodes.push({ node, text: originalText.get(node) });
  }
  const total = nodes.reduce((sum, n) => sum + n.text.length, 0);
  if (!total) return null;

  // Leitores de tela leem o texto final, não o embaralhado
  el.setAttribute("aria-label", nodes.map((n) => n.text).join("").trim());
  const restore = () => nodes.forEach((n) => (n.node.nodeValue = n.text));
  restore();

  const progress = { value: 0 };
  const render = () => {
    const revealed = progress.value * total;
    let index = 0;
    for (const n of nodes) {
      let out = "";
      for (const char of n.text) {
        out += char === " " || char === "\n" || index < revealed ? char : randomGlyph();
        index++;
      }
      n.node.nodeValue = out;
    }
  };

  let tween = null;

  return {
    play(duration, delay = 0) {
      tween?.kill();
      progress.value = 0;
      tween = gsap.to(progress, {
        value: 1,
        delay,
        duration: duration ?? gsap.utils.clamp(0.6, 1.4, total * 0.035),
        ease: "none",
        onStart: render,
        onUpdate: render,
        onComplete: restore,
      });
      return tween;
    },
    isActive: () => Boolean(tween?.isActive()),
    kill() {
      tween?.kill();
      restore();
    },
  };
}

/*
  Decodifica toda vez que o elemento volta para a tela (descendo ou subindo),
  desde que tenha saído antes. A primeira vez é mais lenta; as próximas, rápidas.
  Também decodifica de novo ao passar o mouse. Retorna uma função de limpeza.
*/
export function scrambleOnView(el, { firstDuration, delay = 0, hover = true } = {}) {
  const scramble = createScramble(el);
  if (!scramble) return () => {};

  let seen = false;
  const run = () => {
    scramble.play(seen ? 0.5 : firstDuration, seen ? 0 : delay);
    seen = true;
  };

  const trigger = ScrollTrigger.create({
    trigger: el,
    start: "top 90%",
    end: "bottom 10%",
    onEnter: run,
    onEnterBack: run,
  });

  const onHover = () => {
    if (!scramble.isActive()) scramble.play(0.45);
  };
  if (hover) el.addEventListener("pointerenter", onHover);

  return () => {
    trigger.kill();
    el.removeEventListener("pointerenter", onHover);
    scramble.kill();
  };
}

// Entrada padrão do cabeçalho de seção: label e título decodificando, descrição sobe.
// Retorna a limpeza dos listeners (use como retorno do useGSAP).
export function animateSectionIntro(scope) {
  const label = scope.querySelector(".section-label");
  const title = scope.querySelector(".section-title");
  const description = scope.querySelector(".section-description");
  const cleanups = [];

  if (label) cleanups.push(scrambleOnView(label, { firstDuration: 0.6, hover: false }));
  if (title) cleanups.push(scrambleOnView(title, { delay: 0.1 }));

  if (description) {
    gsap.from(description, {
      autoAlpha: 0,
      y: 16,
      delay: 0.3,
      scrollTrigger: { trigger: description, start: "top 90%" },
    });
  }

  return () => cleanups.forEach((fn) => fn());
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
