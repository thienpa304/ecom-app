"use client";

import { CopyOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Flex, Modal, Typography } from "antd";
import type { MediaAsset } from "@/lib/media-store";
import { displayName, formatBytes } from "./mediaUtils";

type Props = {
  asset: MediaAsset | null;
  onClose: () => void;
  onCopyUrl: (url: string) => void;
  onRename: (asset: MediaAsset) => void;
};

export function MediaPreviewModal({
  asset,
  onClose,
  onCopyUrl,
  onRename,
}: Props) {
  return (
    <Modal
      open={asset != null}
      onCancel={onClose}
      title={asset ? displayName(asset) : ""}
      width={920}
      centered
      destroyOnHidden
      footer={
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={8}>
            <Typography.Text type="secondary">
              {asset ? formatBytes(asset.size) : ""}
            </Typography.Text>
            {asset ? (
              <>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onRename(asset)}
                >
                  Đổi tên
                </Button>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => onCopyUrl(asset.url)}
                >
                  Copy URL
                </Button>
              </>
            ) : null}
          </Flex>
          <Button type="primary" onClick={onClose}>
            Đóng
          </Button>
        </Flex>
      }
      styles={{
        body: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 320,
          background: "#0f172a",
          padding: 16,
        },
      }}
    >
      {asset?.kind === "video" ? (
        <video
          key={asset.url}
          src={asset.url}
          controls
          autoPlay
          style={{ maxWidth: "100%", maxHeight: "70vh", background: "#000" }}
        />
      ) : asset ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset.url}
          alt={displayName(asset)}
          style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
        />
      ) : null}
    </Modal>
  );
}
