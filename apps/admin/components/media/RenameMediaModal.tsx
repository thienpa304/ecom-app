"use client";

import { Input, Modal, Typography } from "antd";
import { useEffect, useState } from "react";
import type { MediaAsset } from "@/lib/media-store";
import { MAX_LABEL_LENGTH } from "./mediaUtils";

type Props = {
  asset: MediaAsset | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (label: string) => void;
};

export function RenameMediaModal({ asset, saving, onCancel, onSubmit }: Props) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(asset?.label ?? "");
  }, [asset]);

  return (
    <Modal
      open={asset != null}
      onCancel={onCancel}
      onOk={() => onSubmit(label)}
      title="Đổi tên file"
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={saving}
      destroyOnHidden
      centered
      width={440}
    >
      <Input
        autoFocus
        value={label}
        maxLength={MAX_LABEL_LENGTH}
        disabled={saving}
        placeholder="Tên file"
        onChange={(e) => setLabel(e.target.value)}
        onPressEnter={() => onSubmit(label)}
      />
      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, display: "block", marginTop: 8 }}
      >
        Tên hiển thị trong thư viện và dùng để tìm kiếm. Bỏ trống để quay lại
        tên file gốc: <Typography.Text code>{asset?.name}</Typography.Text>
      </Typography.Text>
    </Modal>
  );
}
