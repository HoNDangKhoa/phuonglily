"use client";

import { useEffect } from "react";

/** Injects admin-provided HTML; scripts are re-created so the browser executes them. */
export function CustomScripts({
  html,
  target,
}: {
  html: string;
  target: "head" | "body";
}) {
  useEffect(() => {
    if (!html.trim()) return;
    const parent = target === "head" ? document.head : document.body;
    const template = document.createElement("template");
    template.innerHTML = html;
    const added: Node[] = [];
    for (const node of Array.from(template.content.childNodes)) {
      let el: Node = node;
      if (node instanceof HTMLScriptElement) {
        const script = document.createElement("script");
        for (const attr of Array.from(node.attributes)) {
          script.setAttribute(attr.name, attr.value);
        }
        script.text = node.text;
        el = script;
      }
      parent.appendChild(el);
      added.push(el);
    }
    return () => added.forEach((n) => n.parentNode?.removeChild(n));
  }, [html, target]);

  return null;
}
