"use client";

import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Flex,
  Input,
  Modal,
  Typography,
  Upload,
  theme,
} from "antd";
import { useEffect, useState } from "react";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@ecom/shared";
import { MAX_LABEL_LENGTH, formatBytes, slugifyLabel } from "./mediaUtils";

type Props = {
  open: boolean;
  uploading: boolean;
  multiple: boolean;
  accept: "image" | "video" | "all";
  onCancel: () => void;
  onUpload: (files: File[], label: string) => void;
};

const ACCEPT_ATTR: Record<Props["accept"], string> = {
  image: "image/*",
  video: "video/*",
  all: "image/*,video/*",
};

function fileKey(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

export function MediaUploadModal({
  open,
  uploading,
  multiple,
  accept,
  onCancel,
  onUpload,
}: Props) {
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const [files, setFiles] = useState<File[]>([]);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!open) {
      setFiles([]);
      setLabel("");
    }
  }, [open]);

  function stageFiles(incoming: File[]) {
    const oversized = incoming.find((f) => f.size > MAX_UPLOAD_BYTES);
    if (oversized) {
      message.error(
        `File "${oversized.name}" vượt quá ${MAX_UPLOAD_MB}MB. Chọn file nhỏ hơn.`,
      );
    }
    const accepted = incoming.filter((f) => f.size <= MAX_UPLOAD_BYTES);
    if (accepted.length === 0) return;

    setFiles((prev) => {
      if (!multiple) return [accepted[accepted.length - 1]!];
      const seen = new Set(prev.map(fileKey));
      return [...prev, ...accepted.filter((f) => !seen.has(fileKey(f)))];
    });
  }

  function removeAt(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const slug = slugifyLabel(label);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Upload media"
      destroyOnHidden
      centered
      width={520}
      footer={
        <Flex gap={8} justify="flex-end">
          <Button onClick={onCancel} disabled={uploading}>
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            loading={uploading}
            disabled={files.length === 0}
            onClick={() => onUpload(files, label)}
          >
            Upload {files.length > 0 ? files.length : ""} file
          </Button>
        </Flex>
      }
    >
      <Flex vertical gap="middle">
        <div>
          <Typography.Text strong style={{ fontSize: 13 }}>
            Tên file
          </Typography.Text>
          <Input
            value={label}
            maxLength={MAX_LABEL_LENGTH}
            disabled={uploading}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Tên file"
            style={{ marginTop: 4 }}
          />
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12, display: "block", marginTop: 4 }}
          >
            {slug
              ? `Sẽ lưu thành: ${slug}-xxxxxx`
              : "Bỏ trống sẽ giữ tên file gốc."}
          </Typography.Text>
        </div>

        <Upload.Dragger
          multiple={multiple}
          accept={ACCEPT_ATTR[accept]}
          showUploadList={false}
          disabled={uploading}
          beforeUpload={(file, fileList) => {
            if (fileList[0] === file) {
              stageFiles(fileList as unknown as File[]);
            }
            return false;
          }}
          style={{ padding: "12px 0" }}
        >
          <p className="ant-upload-drag-icon">
            <CloudUploadOutlined />
          </p>
          <p className="ant-upload-text">
            {uploading ? "Đang upload..." : "Kéo thả hoặc bấm để chọn file"}
          </p>
          <p className="ant-upload-hint">
            Ảnh / video — tối đa {MAX_UPLOAD_MB}MB mỗi file.
          </p>
        </Upload.Dragger>

        {files.length > 0 ? (
          <div style={{ maxHeight: 180, overflow: "auto" }}>
            {files.map((file, index) => (
              <Flex
                key={fileKey(file)}
                align="center"
                gap={8}
                style={{
                  padding: "4px 0",
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Typography.Text ellipsis style={{ fontSize: 12, flex: 1 }}>
                  {file.name}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  {formatBytes(file.size)}
                </Typography.Text>
                <Button
                  type="text"
                  size="small"
                  danger
                  disabled={uploading}
                  icon={<DeleteOutlined />}
                  aria-label={`Bỏ ${file.name}`}
                  onClick={() => removeAt(index)}
                />
              </Flex>
            ))}
          </div>
        ) : null}
      </Flex>
    </Modal>
  );
}
