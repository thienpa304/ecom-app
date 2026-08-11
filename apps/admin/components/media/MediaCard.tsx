"use client";

import {
  CheckCircleFilled,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Flex, Typography, theme } from "antd";
import type { MediaAsset } from "@/lib/media-store";
import { displayName, formatBytes } from "./mediaUtils";

type Props = {
  asset: MediaAsset;
  mode: "pick" | "manage";
  isPickSelected: boolean;
  isChecked: boolean;
  busy: boolean;
  onOpen: () => void;
  onPreview: () => void;
  onToggleChecked: (checked: boolean) => void;
  onCopyUrl: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export function MediaCard({
  asset,
  mode,
  isPickSelected,
  isChecked,
  busy,
  onOpen,
  onPreview,
  onToggleChecked,
  onCopyUrl,
  onRename,
  onDelete,
}: Props) {
  const { token } = theme.useToken();
  const name = displayName(asset);
  const highlight =
    (mode === "pick" && isPickSelected) || (mode === "manage" && isChecked);

  return (
    <div
      onClick={onOpen}
      style={{
        position: "relative",
        borderRadius: 8,
        border: highlight
          ? `2px solid ${token.colorPrimary}`
          : `1px solid ${token.colorBorderSecondary}`,
        overflow: "hidden",
        cursor: "pointer",
        background: token.colorFillAlter,
      }}
    >
      <div
        style={{
          aspectRatio: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: token.colorFillTertiary,
          position: "relative",
        }}
      >
        {asset.kind === "video" ? (
          <>
            <video
              src={asset.url}
              muted
              preload="metadata"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <PlayCircleOutlined
              style={{
                position: "absolute",
                fontSize: 28,
                color: "#fff",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,.5))",
              }}
            />
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.url}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        {isPickSelected ? (
          <CheckCircleFilled
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              color: token.colorPrimary,
              fontSize: 20,
              background: "#fff",
              borderRadius: "50%",
            }}
          />
        ) : null}

        {mode === "manage" ? (
          <Checkbox
            checked={isChecked}
            aria-label={`Chọn ${name}`}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onToggleChecked(e.target.checked)}
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              background: "rgba(255,255,255,0.92)",
              borderRadius: 4,
              padding: 2,
            }}
          />
        ) : (
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            aria-label="Xem trước"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            style={{
              position: "absolute",
              top: 4,
              left: 4,
              background: "rgba(255,255,255,0.9)",
            }}
          />
        )}
      </div>

      <div style={{ padding: "6px 8px" }}>
        <Typography.Text ellipsis style={{ fontSize: 12, display: "block" }}>
          {name}
        </Typography.Text>
        <Flex align="center" justify="space-between">
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {formatBytes(asset.size)}
          </Typography.Text>
          <Flex>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              aria-label={`Đổi tên ${name}`}
              onClick={(e) => {
                e.stopPropagation();
                onRename();
              }}
            />
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              aria-label="Copy URL"
              onClick={(e) => {
                e.stopPropagation();
                onCopyUrl();
              }}
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Xóa ${name}`}
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            />
          </Flex>
        </Flex>
      </div>
    </div>
  );
}
