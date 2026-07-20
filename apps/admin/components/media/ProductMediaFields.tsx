"use client";

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Card, Empty, Input, Space, Typography } from "antd";
import { useState } from "react";
import { MediaLibraryModal } from "./MediaLibraryModal";

type ImageFieldProps = {
  value: string[];
  onChange: (urls: string[]) => void;
};

export function ProductImagesField({ value, onChange }: ImageFieldProps) {
  const [open, setOpen] = useState(false);

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
          {value.length} ảnh — kéo thứ tự bằng mũi tên (ảnh đầu = ảnh chính)
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
            description="Chưa có ảnh — bấm để mở thư viện media"
          >
            <Button icon={<PlusOutlined />} type="dashed">
              Thêm ảnh
            </Button>
          </Empty>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 10,
          }}
        >
          {value.map((url, index) => (
            <Card
              key={`${url}-${index}`}
              size="small"
              styles={{ body: { padding: 8 } }}
              cover={
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={`Ảnh ${index + 1}`}
                  style={{
                    aspectRatio: "1",
                    objectFit: "cover",
                    width: "100%",
                    display: "block",
                  }}
                />
              }
            >
              <Space
                size={4}
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  {index === 0 ? "Chính" : `#${index + 1}`}
                </Typography.Text>
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
              </Space>
            </Card>
          ))}
          <Card
            size="small"
            style={{
              borderStyle: "dashed",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 140,
            }}
            styles={{
              body: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              },
            }}
            onClick={() => setOpen(true)}
          >
            <Button type="dashed" icon={<PlusOutlined />}>
              Thêm
            </Button>
          </Card>
        </div>
      )}

      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        accept="image"
        multiple
        title="Chọn ảnh sản phẩm"
        initialSelectedUrls={value}
        onSelect={(assets) => {
          // merge newly selected, keep previous order for overlaps, append new
          const prev = value.filter((u) => assets.some((a) => a.url === u));
          const added = assets
            .map((a) => a.url)
            .filter((u) => !prev.includes(u));
          onChange([...prev, ...added]);
        }}
      />
    </div>
  );
}

type VideoFieldProps = {
  value: string;
  onChange: (url: string) => void;
};

export function ProductVideoField({ value, onChange }: VideoFieldProps) {
  const [open, setOpen] = useState(false);
  const isFile =
    Boolean(value) &&
    (/\/storage\/v1\/object\/public\//i.test(value) ||
      /\.(mp4|webm|mov|ogg)(\?|$)/i.test(value));

  return (
    <div>
      <Space style={{ marginBottom: 12 }} wrap>
        <Button
          type="primary"
          icon={<FolderOpenOutlined />}
          onClick={() => setOpen(true)}
        >
          Chọn video từ thư viện
        </Button>
        {value ? (
          <Button danger type="link" onClick={() => onChange("")}>
            Gỡ video
          </Button>
        ) : null}
      </Space>

      {value ? (
        <Card size="small" styles={{ body: { padding: 8 } }}>
          {isFile ? (
            <video
              src={value}
              controls
              style={{
                width: "100%",
                maxHeight: 280,
                background: "#000",
                borderRadius: 6,
              }}
            />
          ) : (
            <Typography.Paragraph style={{ marginBottom: 8 }} copyable>
              {value}
            </Typography.Paragraph>
          )}
        </Card>
      ) : (
        <Card
          size="small"
          style={{ borderStyle: "dashed", cursor: "pointer" }}
          onClick={() => setOpen(true)}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có video — chọn từ thư viện hoặc dán link bên dưới"
          />
        </Card>
      )}

      <div style={{ marginTop: 12 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Hoặc dán link YouTube / TikTok / mp4
        </Typography.Text>
        <Input
          style={{ marginTop: 6 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          allowClear
        />
      </div>

      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        accept="video"
        multiple={false}
        title="Chọn video sản phẩm"
        initialSelectedUrls={value ? [value] : []}
        onSelect={(assets) => {
          onChange(assets[0]?.url ?? "");
        }}
      />
    </div>
  );
}
