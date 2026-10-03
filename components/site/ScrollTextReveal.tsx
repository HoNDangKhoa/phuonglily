"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const BLOCKS = "h1,h2,h3,h4,p,blockquote,figcaption,li,button span";

/**
 * Scroll-linked text reveal, in the style of Framer's Reveal Text:
 * words (or characters on large headings) stay muted and turn to full
 * color as the block moves through the viewport. Scrolling back reverses it.
 */
export function ScrollTextReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let splitting = false;
    let frame = 0;
    const blocks: { el: HTMLElement; words: HTMLElement[] }[] = [];

    const skipped = (el: HTMLElement) =>
      Boolean(
        el.closest(
          "header, nav, form, script, style, .roll, [data-no-reveal], [contenteditable='true']",
        ),
      );

    const isLeaf = (el: HTMLElement) => !el.querySelector(BLOCKS);

    const tokens = (text: string, byChar: boolean) => {
      if (!byChar) return text.split(/(\s+)/);
      if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
        return [...new Intl.Segmenter("vi", { granularity: "grapheme" }).segment(text)].map(
          (part) => part.segment,
        );
      }
      return [...text];
    };

    const split = (el: HTMLElement) => {
      if (skipped(el) || !isLeaf(el)) return;
      const text = el.textContent?.trim() ?? "";
      if (text.length < 2 || !/[A-Za-zÀ-ỹ0-9]/.test(text)) return;
      if (el.matches("button span") && text.length < 8) return;

      const byChar = el.closest("h1") != null && text.length <= 80;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let current = walker.nextNode();
      while (current) {
        const parent = (current as Text).parentElement;
        if (
          current.textContent?.trim() &&
          parent?.dataset.revealWord == null &&
          !parent?.closest(".roll, script, style")
        ) {
          nodes.push(current as Text);
        }
        current = walker.nextNode();
      }
      if (!nodes.length) return;

      for (const node of nodes) {
        const parts = tokens(node.textContent ?? "", byChar);
        const frag = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.append(part);
            continue;
          }
          const span = document.createElement("span");
          span.dataset.revealWord = "";
          span.textContent = part;
          frag.append(span);
        }
        node.replaceWith(frag);
      }
    };

    const collect = () => {
      splitting = true;
      try {
        document.querySelectorAll<HTMLElement>(BLOCKS).forEach(split);
      } finally {
        splitting = false;
      }
      blocks.length = 0;
      const seen = new Set<HTMLElement>();
      document.querySelectorAll<HTMLElement>("[data-reveal-word]").forEach((word) => {
        const el = word.parentElement?.closest<HTMLElement>(BLOCKS);
        if (!el || skipped(el) || seen.has(el)) return;
        seen.add(el);
        blocks.push({ el, words: [...el.querySelectorAll<HTMLElement>("[data-reveal-word]")] });
      });
    };

    const paint = () => {
      const vh = window.innerHeight || 1;
      const start = vh * 0.92;
      const end = vh * 0.42;
      for (const block of blocks) {
        const rect = block.el.getBoundingClientRect();
        if (rect.bottom < -40 || rect.top > vh + 40) continue;
        const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
        const count = block.words.length || 1;
        block.words.forEach((word, index) => {
          const from = index / count;
          const to = (index + 1) / count;
          const local = count === 1 ? progress : (progress - from) / (to - from);
          const t = Math.min(1, Math.max(0, local));
          const mix = (30 + t * 70).toFixed(1);
          word.style.color = `color-mix(in srgb, currentColor ${mix}%, transparent)`;
        });
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        collect();
        paint();
      });
    };

    collect();
    paint();

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    };

    const observer = new MutationObserver((mutations) => {
      if (splitting) return;
      const changed = mutations.some((mutation) => {
        const node = mutation.target;
        const el = node instanceof Element ? node : node.parentElement;
        return Boolean(el && !el.closest("form, input, textarea, header, nav"));
      });
      if (changed) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}
