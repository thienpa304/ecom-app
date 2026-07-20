"use client";

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  LinkOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ProductMedia } from "@ecom/shared";
import { inferMediaKindFromUrl } from "@ecom/shared";
import { Button, Card, Empty, Input, Space, Tag, Typography } from "antd";
import { useState } from "react";
import { MediaLibraryModal } from "./MediaLibraryModal";

/** Draft media item before save (no productId required). */
export type MediaDraftItem = {
  id?: string;
  kind: ProductMedia["kind"];
  url: string;
  alt: string;
  storagePath?: string | null;
  posterUrl?: string | null;
};

type Props = {
  value: MediaDraftItem[];
  onChange: (items: MediaDraftItem[]) => void;
};

const KIND_LABEL: Record<ProductMedia["kind"], string> = {
  image: "Ảnh",
  video: "Video",
  embed: "Embed",
};

function kindFromAsset(
  assetKind: "image" | "video" | "other",
  url: string,
): ProductMedia["kind"] {
  if (assetKind === "image") return "image";
  if (assetKind === "video") return "video";
  return inferMediaKindFromUrl(url);
}

export function ProductMediaField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [embedInput, setEmbedInput] = useState("");

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    onChange(next);
  }

  function addEmbedUrl() {
    const url = embedInput.trim();
    if (!url) return;
    const kind = inferMediaKindFromUrl(url);
    onChange([
      ...value,
      {
        kind: kind === "image" ? "embed" : kind,
        url,
        alt: kind === "image" ? "Media" : "Video sản phẩm",
        storagePath: null,
        posterUrl: null,
      },
    ]);
    setEmbedInput("");
  }

  function updateAlt(index: number, alt: string) {
    const next = [...value];
    next[index] = { ...next[index]!, alt };
    onChange(next);
  }

  return (
    <div>
      <Space style={{ marginBottom: 12 }} wrap>
        <Button
          type="primary"
          icon={<FolderOpenOutlined />}
          onClick={() => setOpen(true)}
        >
          Chọn từ thư viện
        </Button>
        <Typography.Text type="secondary">
          {value.length} mục — sắp xếp chung ảnh & video (mục đầu = ảnh chính
          nếu là ảnh)
        </Typography.Text>
      </Space>

      {value.length === 0 ? (
        <Card
          size="small"
          styles={{ body: { padding: 24 } }}
          style={{
            borderStyle: "dashed",
            textAlign: "center",
            cursor: "pointer",
          }}
          onClick={() => setOpen(true)}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có media — bấm để mở thư viện"
          >
            <Button icon={<PlusOutlined />} type="dashed">
              Thêm media
            </Button>
          </Empty>
        </Card>
      ) : (
        <div className="space-y-2">
          {value.map((item, index) => (
            <Card key={`${item.url}-${index}`} size="small">
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 88,
                    height: 88,
                    flexShrink: 0,
                    borderRadius: 6,
                    overflow: "hidden",
                    background: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.alt}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : item.kind === "video" ? (
                    <video
                      src={item.url}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        background: "#000",
                      }}
                    />
                  ) : (
                    <LinkOutlined style={{ fontSize: 28, color: "#999" }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Space size={4} style={{ marginBottom: 6 }}>
                    <Tag>{KIND_LABEL[item.kind]}</Tag>
                    {index === 0 && item.kind === "image" ? (
                      <Tag color="blue">Ảnh chính</Tag>
                    ) : (
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                        #{index + 1}
                      </Typography.Text>
                    )}
                  </Space>
                  <Input
                    size="small"
                    value={item.alt}
                    onChange={(e) => updateAlt(index, e.target.value)}
                    placeholder="Alt text"
                    style={{ marginBottom: 6 }}
                  />
                  <Typography.Paragraph
                    type="secondary"
                    ellipsis={{ rows: 1 }}
                    style={{ marginBottom: 0, fontSize: 11 }}
                    copyable
                  >
                    {item.url}
                  </Typography.Paragraph>
                </div>

                <Space size={0}>
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowLeftOutlined />}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowRightOutlined />}
                    disabled={index === value.length - 1}
                    onClick={() => move(index, 1)}
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeAt(index)}
                  />
                </Space>
              </div>
            </Card>
          ))}

          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
          >
            Thêm từ thư viện
          </Button>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Hoặc dán link YouTube / TikTok / mp4
        </Typography.Text>
        <Space.Compact style={{ width: "100%", marginTop: 6 }}>
          <Input
            value={embedInput}
            onChange={(e) => setEmbedInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            onPressEnter={addEmbedUrl}
          />
          <Button icon={<LinkOutlined />} onClick={addEmbedUrl}>
            Thêm
          </Button>
        </Space.Compact>
      </div>

      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        accept="all"
        multiple
        title="Chọn media sản phẩm"
        initialSelectedUrls={value.map((m) => m.url)}
        onSelect={(assets) => {
          const prev = value.filter((m) => assets.some((a) => a.url === m.url));
          const added = assets
            .filter((a) => !prev.some((m) => m.url === a.url))
            .map((a) => ({
              kind: kindFromAsset(a.kind, a.url),
              url: a.url,
              alt:
                a.kind === "video"
                  ? "Video sản phẩm"
                  : `Ảnh ${value.length + 1}`,
              storagePath: a.path,
              posterUrl: null,
            }));
          onChange([...prev, ...added]);
        }}
      />
    </div>
  );
}
