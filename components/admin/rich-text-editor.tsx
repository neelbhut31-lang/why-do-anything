"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold, Heading2, Heading3, ImagePlus, Italic, Link as LinkIcon,
  List, ListOrdered, Quote, Redo2, Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonProps = { active?: boolean; label: string; onClick: () => void; children: React.ReactNode };

function ToolButton({ active, label, onClick, children }: ButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid size-9 place-items-center rounded-lg transition",
        active ? "bg-moss-100 text-moss-900 dark:bg-moss-900 dark:text-moss-100" : "text-black/55 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5",
      )}
    >
      {children}
    </button>
  );
}

async function uploadImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: form });
  if (!response.ok) throw new Error("Image upload failed");
  return (await response.json()) as { url: string };
}

export function RichTextEditor({ initialContent }: { initialContent: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const insertImage = async (file?: File) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const { url } = await uploadImage(file);
      editor?.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      console.error(err);
      window.alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { class: "editor-image" } }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose-wda min-h-[420px] px-5 py-6 outline-none sm:px-8",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            setUploadingImage(true);
            uploadImage(file)
              .then(({ url }) => {
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                const node = view.state.schema.nodes.image.create({ src: url, alt: file.name });
                const transaction = coordinates 
                  ? view.state.tr.insert(coordinates.pos, node)
                  : view.state.tr.insert(view.state.selection.to, node);
                view.dispatch(transaction);
              })
              .catch((err) => {
                console.error(err);
                window.alert("Image upload failed");
              })
              .finally(() => {
                setUploadingImage(false);
              });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (event.clipboardData?.files?.length) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith("image/")) {
            setUploadingImage(true);
            uploadImage(file)
              .then(({ url }) => {
                const node = view.state.schema.nodes.image.create({ src: url, alt: file.name });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              })
              .catch((err) => {
                console.error(err);
                window.alert("Image upload failed");
              })
              .finally(() => {
                setUploadingImage(false);
              });
            return true;
          }
        }
        return false;
      },
    },
  });

  if (!editor) return <div className="min-h-[480px] animate-pulse rounded-xl bg-black/5 dark:bg-white/5" />;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (!url) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-[#1b1e1a]">
      <input type="hidden" name="content" value={editor.getHTML()} />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => void insertImage(event.target.files?.[0])}
      />
      <div className="sticky top-0 z-10 flex flex-wrap gap-0.5 border-b border-black/[0.08] bg-white/95 p-2 backdrop-blur dark:border-white/[0.08] dark:bg-[#1b1e1a]/95 items-center justify-between">
        <div className="flex flex-wrap gap-0.5">
          <ToolButton label="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={16} /></ToolButton>
          <ToolButton label="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={16} /></ToolButton>
          <span className="mx-1 w-px bg-black/10 dark:bg-white/10" />
          <ToolButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={17} /></ToolButton>
          <ToolButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={17} /></ToolButton>
          <ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></ToolButton>
          <ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></ToolButton>
          <ToolButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={17} /></ToolButton>
          <ToolButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={17} /></ToolButton>
          <ToolButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></ToolButton>
          <ToolButton label="Link" active={editor.isActive("link")} onClick={setLink}><LinkIcon size={16} /></ToolButton>
          <ToolButton label="Insert image" onClick={() => inputRef.current?.click()}><ImagePlus size={17} /></ToolButton>
        </div>
        {uploadingImage ? (
          <span className="text-xs text-moss-700 dark:text-moss-300 font-medium animate-pulse pr-2">
            Uploading image...
          </span>
        ) : null}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

