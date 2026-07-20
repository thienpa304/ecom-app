"use client";

import { FolderOpenOutlined } from "@ant-design/icons";
import { Button, Card, Typography } from "antd";
import { useState } from "react";
import { MediaLibraryModal } from "./MediaLibraryModal";

export function MediaLibraryPage() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Card>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          Thư viện Media
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Quản lý ảnh / video dùng chung cho sản phẩm (upload, xem, xóa) — tương
          tự Media Library của Strapi.
        </Typography.Paragraph>
        <Button
          type="primary"
          icon={<FolderOpenOutlined />}
          onClick={() => setOpen(true)}
        >
          Mở thư viện
        </Button>
      </Card>

      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        accept="all"
        multiple
        mode="manage"
        title="Thư viện Media"
      />
    </>
  );
}
