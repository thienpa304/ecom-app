"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button, Space, Typography } from "antd";
import { useEffect } from "react";

type Props = {
  value?: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type={active ? "primary" : "default"}
      size="small"
      onClick={onClick}
      htmlType="button"
    >
      {children}
    </Button>
  );
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Nhập mô tả sản phẩm…",
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "ecom-rich-editor",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.isEmpty ? "" : ed.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 8,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div
        style={{
          padding: "8px 10px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fafafa",
        }}
      >
        <Space wrap size={4}>
          <ToolbarButton
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            H3
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            Đậm
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            Nghiêng
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1. List
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              const prev = editor.getAttributes("link").href as
                | string
                | undefined;
              const url = window.prompt("URL liên kết", prev || "https://");
              if (url === null) return;
              if (url === "") {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                return;
              }
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url })
                .run();
            }}
          >
            Link
          </ToolbarButton>
          <Button
            size="small"
            htmlType="button"
            onClick={() =>
              editor.chain().focus().unsetAllMarks().clearNodes().run()
            }
          >
            Xóa format
          </Button>
        </Space>
        <Typography.Text
          type="secondary"
          style={{ display: "block", marginTop: 6, fontSize: 12 }}
        >
          Hỗ trợ tiêu đề, list, in đậm — phù hợp bài SEO dài.
        </Typography.Text>
      </div>
      <EditorContent editor={editor} />
      <style>{`
        .ecom-rich-editor {
          min-height: 220px;
          padding: 12px 14px;
          outline: none;
          font-size: 14px;
          line-height: 1.6;
        }
        .ecom-rich-editor p { margin: 0 0 0.75em; }
        .ecom-rich-editor h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 1em 0 0.5em;
        }
        .ecom-rich-editor h3 {
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0.9em 0 0.4em;
        }
        .ecom-rich-editor ul,
        .ecom-rich-editor ol {
          padding-left: 1.4em;
          margin: 0 0 0.75em;
        }
        .ecom-rich-editor a {
          color: #2563eb;
          text-decoration: underline;
        }
        .ecom-rich-editor p.is-editor-empty:first-child::before {
          color: #bfbfbf;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
