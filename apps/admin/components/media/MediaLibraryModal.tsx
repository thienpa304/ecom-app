"use client";

import { Button, Modal, Space, Typography } from "antd";
import { useCallback, useState } from "react";
import type { MediaAsset } from "@/lib/store";
import { MediaLibraryPanel } from "./MediaLibraryPanel";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect?: (assets: MediaAsset[]) => void;
  multiple?: boolean;
  accept?: "image" | "video" | "all";
  title?: string;
  initialSelectedUrls?: string[];
  mode?: "pick" | "manage";
};

export function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  multiple = true,
  accept = "all",
  title = "Thư viện Media",
  initialSelectedUrls = [],
  mode = "pick",
}: Props) {
  const [selected, setSelected] = useState<MediaAsset[]>([]);

  const handleSelectionChange = useCallback((assets: MediaAsset[]) => {
    setSelected(assets);
  }, []);

  function confirmSelect() {
    const ordered = multiple ? selected : selected.slice(0, 1);
    onSelect?.(ordered);
    onClose();
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={title}
      width={920}
      styles={{ body: { maxHeight: "70vh", overflow: "auto" } }}
      footer={
        mode === "manage" ? (
          <Button type="primary" onClick={onClose}>
            Đóng
          </Button>
        ) : (
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Typography.Text type="secondary">
              Đã chọn {selected.length} file
            </Typography.Text>
            <Space>
              <Button onClick={onClose}>Hủy</Button>
              <Button
                type="primary"
                disabled={selected.length === 0}
                onClick={confirmSelect}
              >
                Chọn {selected.length > 0 ? `(${selected.length})` : ""}
              </Button>
            </Space>
          </Space>
        )
      }
    >
      <MediaLibraryPanel
        active={open}
        accept={accept}
        multiple={multiple}
        mode={mode}
        initialSelectedUrls={initialSelectedUrls}
        onSelectionChange={mode === "pick" ? handleSelectionChange : undefined}
      />
    </Modal>
  );
}
