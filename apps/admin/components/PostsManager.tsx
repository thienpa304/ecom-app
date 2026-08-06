"use client";

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { Post } from "@ecom/shared";
import { App, Button, Grid, Space, Table, Tag, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deletePostAction, togglePostPublishAction } from "@/lib/actions/posts";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://dienmaylocphatdat.vn";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

export function PostsManager({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [pending, startTransition] = useTransition();
  const isMobile = !Grid.useBreakpoint().md;

  function onToggle(post: Post) {
    startTransition(async () => {
      try {
        await togglePostPublishAction(post.id);
        message.success(post.isPublished ? "Đã gỡ bài" : "Đã đăng bài");
        router.refresh();
      } catch (e) {
        message.error(e instanceof Error ? e.message : "Không đổi được");
      }
    });
  }

  function onDelete(post: Post) {
    modal.confirm({
      title: "Xóa bài viết?",
      content: `"${post.title}" sẽ bị xóa vĩnh viễn. Nếu bài đã có thứ hạng trên Google, cân nhắc gỡ đăng thay vì xóa.`,
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: () =>
        startTransition(async () => {
          try {
            await deletePostAction(post.id);
            message.success("Đã xóa bài viết");
            router.refresh();
          } catch (e) {
            message.error(e instanceof Error ? e.message : "Không xóa được");
          }
        }),
    });
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Space style={{ justifyContent: "space-between", width: "100%" }} wrap>
        <Typography.Text type="secondary">
          {posts.length} bài viết · {posts.filter((p) => p.isPublished).length}{" "}
          đang đăng
        </Typography.Text>
        <Link href="/posts/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Viết bài mới
          </Button>
        </Link>
      </Space>

      <Table<Post>
        dataSource={posts}
        rowKey="id"
        loading={pending}
        size={isMobile ? "small" : "middle"}
        scroll={{ x: true }}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
        columns={[
          {
            title: "Tiêu đề",
            dataIndex: "title",
            render: (_: unknown, post: Post) => (
              <Space direction="vertical" size={0}>
                <Link href={`/posts/${post.id}/edit`}>
                  <Typography.Text strong>{post.title}</Typography.Text>
                </Link>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  /cam-nang/{post.slug}
                </Typography.Text>
              </Space>
            ),
          },
          {
            title: "Trạng thái",
            dataIndex: "isPublished",
            width: 120,
            render: (_: unknown, post: Post) =>
              post.isPublished ? (
                <Tag color="green">Đang đăng</Tag>
              ) : (
                <Tag>Nháp</Tag>
              ),
          },
          {
            title: "Ngày đăng",
            dataIndex: "publishedAt",
            width: 130,
            responsive: ["md"],
            render: (_: unknown, post: Post) => formatDate(post.publishedAt),
          },
          {
            title: "",
            key: "actions",
            width: 200,
            render: (_: unknown, post: Post) => (
              <Space size={4} wrap>
                <Button size="small" onClick={() => onToggle(post)}>
                  {post.isPublished ? "Gỡ" : "Đăng"}
                </Button>
                {post.isPublished ? (
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    href={`${SITE_URL}/cam-nang/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ) : null}
                <Link href={`/posts/${post.id}/edit`}>
                  <Button size="small" icon={<EditOutlined />} />
                </Link>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(post)}
                />
              </Space>
            ),
          },
        ]}
      />
    </Space>
  );
}
