"use client";

import { Card, Typography } from "antd";
import { MediaLibraryPanel } from "./MediaLibraryPanel";

export function MediaLibraryPage() {
  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Thư viện Media
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Quản lý ảnh / video dùng chung cho sản phẩm (upload, xem, xóa) — tương
        tự Media Library của Strapi.
      </Typography.Paragraph>

      <MediaLibraryPanel mode="manage" accept="all" active />
    </Card>
  );
}
