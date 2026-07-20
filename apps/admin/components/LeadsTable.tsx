"use client";

import type { Lead } from "@ecom/shared";
import { Card, Grid, Table, Typography } from "antd";
import { formatDate } from "@/lib/format";

type Row = Lead & { productName: string };

export function LeadsTable({ rows }: { rows: Row[] }) {
  const isMobile = !Grid.useBreakpoint().md;

  return (
    <Card size={isMobile ? "small" : "default"} styles={{ body: { padding: isMobile ? 8 : 24 } }}>
      <Table
        rowKey="id"
        dataSource={rows}
        size={isMobile ? "small" : "middle"}
        scroll={{ x: 640 }}
        pagination={{
          pageSize: isMobile ? 10 : 20,
          showSizeChanger: !isMobile,
          simple: isMobile,
        }}
        locale={{ emptyText: "Chưa có lead." }}
        columns={[
          {
            title: "Thời gian",
            dataIndex: "createdAt",
            width: 150,
            render: (v: string) => (
              <Typography.Text type="secondary">{formatDate(v)}</Typography.Text>
            ),
          },
          { title: "Họ tên", dataIndex: "name" },
          { title: "SĐT", dataIndex: "phone", width: 120 },
          {
            title: "Sản phẩm",
            dataIndex: "productName",
            responsive: ["sm"],
          },
          {
            title: "Ghi chú",
            dataIndex: "note",
            responsive: ["md"],
            render: (note: string) => note || "—",
          },
        ]}
      />
    </Card>
  );
}
