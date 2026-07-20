"use client";

import type { Lead } from "@ecom/shared";
import { Card, Table, Typography } from "antd";
import { formatDate } from "@/lib/format";

type Row = Lead & { productName: string };

export function LeadsTable({ rows }: { rows: Row[] }) {
  return (
    <Card>
      <Table
        rowKey="id"
        dataSource={rows}
        scroll={{ x: 800 }}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        locale={{ emptyText: "Chưa có lead." }}
        columns={[
          {
            title: "Thời gian",
            dataIndex: "createdAt",
            width: 170,
            render: (v: string) => (
              <Typography.Text type="secondary">{formatDate(v)}</Typography.Text>
            ),
          },
          { title: "Họ tên", dataIndex: "name" },
          { title: "SĐT", dataIndex: "phone", width: 130 },
          { title: "Sản phẩm", dataIndex: "productName" },
          {
            title: "Ghi chú",
            dataIndex: "note",
            render: (note: string) => note || "—",
          },
        ]}
      />
    </Card>
  );
}
