"use client";

import { useEffect, useRef } from "react";

type Listener = Parameters<Document["addEventListener"]>[1];

/**
 * Hiển thị nội dung HTML nhập từ CMS và chạy các thẻ <script> bên trong
 * (script chèn qua innerHTML mặc định không chạy).
 */
export function HtmlContent({
  html,
  className,
  as: Tag = "div",
}: {
  html: string;
  className?: string;
  as?: "div" | "article";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const scripts = [...root.querySelectorAll("script")].filter(
      (s) => !s.dataset.cmsRan,
    );
    if (!scripts.length) return;

    // Trang đã tải xong nên DOMContentLoaded / load sẽ không bắn lại — gọi handler ngay.
    const docAdd = document.addEventListener.bind(document);
    const winAdd = window.addEventListener.bind(window);
    const runNow = (listener: Listener) => {
      setTimeout(() => {
        if (typeof listener === "function") listener.call(document, new Event("DOMContentLoaded"));
        else listener?.handleEvent(new Event("DOMContentLoaded"));
      }, 0);
    };
    document.addEventListener = ((type: string, listener: Listener, options?: boolean | AddEventListenerOptions) => {
      if (type === "DOMContentLoaded") return runNow(listener);
      return docAdd(type, listener, options);
    }) as Document["addEventListener"];
    window.addEventListener = ((type: string, listener: Listener, options?: boolean | AddEventListenerOptions) => {
      if (type === "DOMContentLoaded" || type === "load") return runNow(listener);
      return winAdd(type, listener, options);
    }) as Window["addEventListener"];

    try {
      for (const old of scripts) {
        const script = document.createElement("script");
        for (const attr of old.attributes) {
          if (attr.name === "type" || attr.name === "data-type") continue;
          script.setAttribute(attr.name, attr.value);
        }
        const type = old.getAttribute("data-type");
        if (type) script.type = type;
        script.text = old.text;
        script.dataset.cmsRan = "1";
        old.dataset.cmsRan = "1";
        old.replaceWith(script);
      }
    } finally {
      delete (document as { addEventListener?: unknown }).addEventListener;
      delete (window as { addEventListener?: unknown }).addEventListener;
    }
  }, [html]);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      dangerouslySetInnerHTML={{ __html: deferScripts(html) }}
    />
  );
}

/** Không cho script chạy khi trình duyệt parse HTML từ server — chỉ chạy một lần trong effect. */
function deferScripts(html: string) {
  if (!/<script\b/i.test(html)) return html;
  return html.replace(/<script\b([^>]*)>/gi, (_match, attrs: string) => {
    const rest = attrs.replace(/\stype\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i, " data-type=$1");
    return `<script type="text/cms-deferred"${rest}>`;
  });
}