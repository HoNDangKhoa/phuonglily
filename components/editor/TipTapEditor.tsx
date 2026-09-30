"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Editor as TinyMCEEditor } from "tinymce";
import { importRemoteImages, isExternalImage, normalizeImages } from "@/lib/html-images";
import { uploadAsset } from "@/lib/upload-client";

const uploadImage = (file: File) => uploadAsset(file);
const subscribeNoop = () => () => {};

/**
 * Rich text editor đầy đủ toolbar (kiểu CKEditor).
 * TinyMCE GPL self-host — tránh lỗi license LTS của CKEditor 4.23+.
 */
export function TipTapEditor({
  value,
  onChange,
  height = 420,
}: {
  value: string;
  onChange: (html: string) => void;
  height?: number;
}) {
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const [sourceMode, setSourceMode] = useState(false);
  const [source, setSource] = useState("");
  const [imageStatus, setImageStatus] = useState("");
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const importImagesRef = useRef(async (editor: TinyMCEEditor) => {
    const body = editor.getBody();
    if (!body) return;
    const setSrc = (img: HTMLImageElement, src: string) =>
      editor.dom.setAttribs(img, { src, "data-mce-src": src });
    normalizeImages(body.querySelectorAll("img"), setSrc);
    const images = [...body.querySelectorAll("img")];
    const external = [
      ...new Set(
        images.map((img) => img.getAttribute("src") || "").filter(isExternalImage),
      ),
    ];
    if (external.length) {
      setImageStatus(`Đang tải ${external.length} ảnh về máy chủ…`);
      let results: Record<string, string | null> = {};
      try {
        results = await importRemoteImages(external);
      } catch {
        results = {};
      }
      let failed = 0;
      for (const img of body.querySelectorAll("img")) {
        const src = img.getAttribute("src") || "";
        if (!external.includes(src)) continue;
        const next = results[src];
        if (next) {
          setSrc(img, next);
          img.removeAttribute("referrerpolicy");
        } else {
          failed += 1;
          editor.dom.setAttrib(img, "referrerpolicy", "no-referrer");
        }
      }
      const ok = external.length - failed;
      setImageStatus(
        failed
          ? `Đã tải ${ok}/${external.length} ảnh về máy chủ. ${failed} ảnh không tải được — giữ link gốc, nên tải ảnh lên bằng nút chèn ảnh.`
          : `Đã tải ${ok} ảnh về máy chủ.`,
      );
    }
    editor.undoManager.add();
    onChangeRef.current(editor.getContent());
  });

  const init = useMemo(
    () => ({
      height,
      menubar: false,
      branding: false,
      promotion: false,
      statusbar: true,
      resize: true as const,
      skin: "oxide",
      content_css: "default",
      entity_encoding: "raw" as const,
      valid_elements: "*[*]",
      extended_valid_elements: "*[*]",
      valid_children: "+body[style|link],+div[style]",
      verify_html: false,
      convert_urls: false,
      paste_preprocess: (_editor: TinyMCEEditor, args: { content: string }) => {
        args.content = extractDocumentHtml(decodePastedHtml(args.content));
      },
      plugins: [
        "advlist",
        "anchor",
        "autolink",
        "charmap",
        "code",
        "codesample",
        "directionality",
        "emoticons",
        "fullscreen",
        "help",
        "image",
        "insertdatetime",
        "link",
        "lists",
        "media",
        "pagebreak",
        "preview",
        "searchreplace",
        "table",
        "visualblocks",
        "visualchars",
        "wordcount",
      ],
      toolbar_mode: "wrap" as const,
      toolbar: [
        "htmlsource importimages | newdocument preview print | cut copy paste pastetext | undo redo | searchreplace selectall | bold italic underline strikethrough subscript superscript removeformat",
        "blocks | bullist numlist outdent indent | blockquote | alignleft aligncenter alignright alignjustify | ltr rtl | link unlink anchor | image media table hr emoticons charmap pagebreak",
        "styles fontfamily fontsize lineheight | forecolor backcolor | fullscreen visualblocks help",
      ].join(" | "),
      font_family_formats:
        "Andale Mono=andale mono,monospace; Arial=arial,helvetica,sans-serif; Arial Black=arial black,sans-serif; Book Antiqua=book antiqua,palatino,serif; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier,monospace; Georgia=georgia,palatino,serif; Helvetica=helvetica,arial,sans-serif; Impact=impact,sans-serif; Tahoma=tahoma,arial,helvetica,sans-serif; Times New Roman=times new roman,times,serif; Trebuchet MS=trebuchet ms,geneva,sans-serif; Verdana=verdana,geneva,sans-serif",
      font_size_formats: "8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt",
      line_height_formats: "1 1.1 1.2 1.3 1.4 1.5 1.6 1.8 2 2.5 3",
      block_formats:
        "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre",
      style_formats_merge: true,
      style_formats: [
        {
          title: "Kiểu chữ",
          items: [
            { title: "Đậm", inline: "strong" },
            { title: "Nghiêng", inline: "em" },
            {
              title: "Gạch chân",
              inline: "span",
              styles: { "text-decoration": "underline" },
            },
            { title: "Mã", inline: "code" },
          ],
        },
        {
          title: "Khối",
          items: [
            { title: "Trích dẫn", block: "blockquote" },
            { title: "Div", block: "div" },
            { title: "Pre", block: "pre" },
          ],
        },
      ],
      table_toolbar:
        "tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",
      image_title: true,
      automatic_uploads: true,
      paste_data_images: true,
      file_picker_types: "image media",
      images_upload_handler: async (blobInfo: {
        blob: () => Blob;
        filename: () => string;
      }) => {
        const blob = blobInfo.blob();
        const file = new File([blob], blobInfo.filename() || "image.png", {
          type: blob.type || "image/png",
        });
        return uploadImage(file);
      },
      file_picker_callback: (
        callback: (url: string, meta?: Record<string, string>) => void,
        _value: string,
        meta: Record<string, unknown>,
      ) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept =
          meta.filetype === "media" ? "video/*,audio/*" : "image/*";
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          const url = await uploadImage(file);
          callback(url, { title: file.name, alt: file.name });
        };
        input.click();
      },
      content_style:
        "body{font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px 8px}",
      setup: (editor: TinyMCEEditor) => {
        editorRef.current = editor;
        editor.ui.registry.addButton("htmlsource", {
          text: "Mã HTML",
          icon: "sourcecode",
          tooltip: "Nhập / sửa bằng thẻ HTML",
          onAction: () => {
            setSource(editor.getContent());
            setSourceMode(true);
          },
        });
        editor.ui.registry.addButton("importimages", {
          text: "Tải ảnh về",
          icon: "image",
          tooltip: "Tải các ảnh đang dùng link website khác về máy chủ",
          onAction: () => {
            void importImagesRef.current(editor);
          },
        });
        editor.on("PastePostProcess", (e: { node: HTMLElement }) => {
          normalizeImages(e.node.querySelectorAll("img"), (img, src) =>
            img.setAttribute("src", src),
          );
          if (e.node.querySelector("img")) {
            setTimeout(() => void importImagesRef.current(editor), 50);
          }
        });
      },
    }),
    [height],
  );

  if (!mounted) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-black/15 bg-[#f8f4ee] text-sm font-semibold text-ink/45">
        Đang tải trình soạn thảo…
      </div>
    );
  }

  return (
    <div className="ck-like-editor overflow-hidden rounded-xl border border-black/15 bg-[#f1ebe4] p-1 [&_.tox-tinymce]:!border-0 [&_.tox-editor-header]:!bg-[#f8f4ee] [&_.tox-statusbar]:!bg-[#f8f4ee]">
      {sourceMode && (
        <div className="overflow-hidden rounded-lg bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-[#f8f4ee] px-3 py-2">
            <span className="text-xs font-semibold text-ink/60">
              Chế độ mã HTML — nhập trực tiếp thẻ HTML
            </span>
            <button
              type="button"
              className="rounded-md bg-[#3f7d3a] px-3 py-1 text-xs font-semibold text-white hover:bg-[#2f6230]"
              onClick={() => {
                const editor = editorRef.current;
                const html = normalizeHtmlImages(source);
                setSourceMode(false);
                if (!editor) {
                  onChange(html);
                  return;
                }
                editor.setContent(html);
                onChange(editor.getContent());
                void importImagesRef.current(editor);
              }}
            >
              Quay lại trình soạn thảo
            </button>
          </div>
          <textarea
            aria-label="Mã HTML"
            spellCheck={false}
            className="block w-full resize-y bg-white p-3 font-mono text-[13px] leading-relaxed text-ink outline-none"
            style={{ height: height - 44 }}
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              onChange(normalizeHtmlImages(e.target.value));
            }}
          />
        </div>
      )}
      {imageStatus && (
        <div className="flex items-start justify-between gap-3 px-2 py-1.5 text-xs font-semibold text-ink/65">
          <span>{imageStatus}</span>
          <button
            type="button"
            className="shrink-0 text-ink/40 hover:text-ink"
            onClick={() => setImageStatus("")}
          >
            Đóng
          </button>
        </div>
      )}
      <div className={sourceMode ? "hidden" : undefined}>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        value={value}
        onEditorChange={(html) => onChange(html)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        init={init as any}
      />
      </div>
    </div>
  );
}

/**
 * Dán cả trang HTML (<html><head><style>…</head><body>…) → giữ lại CSS/font/script
 * trong <head> và nội dung <body>, vì trình soạn thảo chỉ giữ phần body.
 */
function extractDocumentHtml(html: string): string {
  if (!/<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i.test(html)) return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const assets = [
    ...doc.head.querySelectorAll('style, link[rel~="stylesheet"], script'),
  ]
    .map((el) => el.outerHTML)
    .join("\n");
  const bodyClass = doc.body.getAttribute("class");
  const body = doc.body.innerHTML.trim();
  const content = bodyClass ? `<div class="${bodyClass}">\n${body}\n</div>` : body;
  return [assets, content].filter(Boolean).join("\n");
}

function normalizeHtmlImages(input: string): string {
  const html = extractDocumentHtml(input);
  if (!/<img\b/i.test(html)) return html;
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const images = doc.body.querySelectorAll("img");
  const before = doc.body.innerHTML;
  normalizeImages(images, (img, src) => img.setAttribute("src", src));
  const after = doc.body.innerHTML;
  return after === before ? html : after;
}

const REAL_TAG = /<(?!\/?(p|br)\b)[a-z][^>]*>/i;
const ESCAPED_TAG = /&lt;\/?[a-z][\s\S]*?&gt;/i;

/** Mã HTML dán dưới dạng văn bản thuần (bị escape thành &lt;tag&gt;) → chèn thành HTML thật. */
function decodePastedHtml(content: string): string {
  if (REAL_TAG.test(content) || !ESCAPED_TAG.test(content)) return content;
  const text = content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<\/?p[^>]*>/gi, "");
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}
