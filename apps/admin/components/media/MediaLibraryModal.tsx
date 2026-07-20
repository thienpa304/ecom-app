"use client";

import {
  CheckCircleFilled,
  CloudUploadOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Empty,
  Input,
  Modal,
  Segmented,
  Space,
  Spin,
  Typography,
  Upload,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteMediaAction,
  listMediaAction,
  uploadMediaAction,
} from "@/lib/actions/media";
import type { MediaAsset } from "@/lib/store";

type Filter = "all" | "image" | "video";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called when user confirms selection (pick mode) */
  onSelect?: (assets: MediaAsset[]) => void;
  multiple?: boolean;
  /** Pre-filter library */
  accept?: "image" | "video" | "all";
  title?: string;
  initialSelectedUrls?: string[];
  /** pick = chọn gắn vào SP; manage = chỉ quản lý thư viện */
  mode?: "pick" | "manage";
};

function formatBytes(n: number | null) {
  if (n == null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const { message, modal } = App.useApp();
  const [filter, setFilter] = useState<Filter>(
    accept === "all" ? "all" : accept,
  );
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listMediaAction(filter === "all" ? "all" : filter);
      setAssets(list);
    } catch {
      message.error("Không tải được thư viện media");
    } finally {
      setLoading(false);
    }
  }, [filter, message]);

  useEffect(() => {
    if (!open) return;
    setFilter(accept === "all" ? "all" : accept);
    setSelected(new Set(initialSelectedUrls));
    setQuery("");
  }, [open, accept, initialSelectedUrls]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) || a.path.toLowerCase().includes(q),
    );
  }, [assets, query]);

  function toggle(asset: MediaAsset) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (multiple) {
        if (next.has(asset.url)) next.delete(asset.url);
        else next.add(asset.url);
      } else {
        next.clear();
        next.add(asset.url);
      }
      return next;
    });
  }

  async function onUpload(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of files) fd.append("files", f);
      const res = await uploadMediaAction(fd);
      if (res.error) {
        message.error(res.error);
        return;
      }
      message.success(`Đã upload ${res.urls.length} file`);
      await load();
      if (res.urls.length) {
        setSelected((prev) => {
          const next = multiple ? new Set(prev) : new Set<string>();
          for (const url of res.urls) next.add(url);
          return next;
        });
      }
    } finally {
      setUploading(false);
    }
  }

  function onDelete(asset: MediaAsset) {
    modal.confirm({
      title: "Xóa file này?",
      content: asset.name,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        const res = await deleteMediaAction(asset.path);
        if (!res.ok) {
          message.error(res.error ?? "Xóa thất bại");
          return;
        }
        message.success("Đã xóa");
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(asset.url);
          return next;
        });
        await load();
      },
    });
  }

  function confirmSelect() {
    const byUrl = new Map(assets.map((a) => [a.url, a]));
    const ordered: MediaAsset[] = [];
    for (const url of selected) {
      const found = byUrl.get(url);
      if (found) ordered.push(found);
      else {
        ordered.push({
          path: url,
          url,
          name: url.split("/").pop() ?? url,
          size: null,
          kind: accept === "video" ? "video" : "image",
          updatedAt: null,
        });
      }
    }
    onSelect?.(multiple ? ordered : ordered.slice(0, 1));
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
              Đã chọn {selected.size} file
            </Typography.Text>
            <Space>
              <Button onClick={onClose}>Hủy</Button>
              <Button
                type="primary"
                disabled={selected.size === 0}
                onClick={confirmSelect}
              >
                Chọn {selected.size > 0 ? `(${selected.size})` : ""}
              </Button>
            </Space>
          </Space>
        )
      }
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Upload.Dragger
          multiple={multiple || accept !== "video"}
          accept={
            accept === "video"
              ? "video/*"
              : accept === "image"
                ? "image/*"
                : "image/*,video/*"
          }
          showUploadList={false}
          disabled={uploading}
          beforeUpload={(file, fileList) => {
            // only fire once for the batch
            if (fileList[0] === file) {
              void onUpload(fileList as unknown as File[]);
            }
            return false;
          }}
          style={{ padding: "8px 0" }}
        >
          <p className="ant-upload-drag-icon">
            <CloudUploadOutlined />
          </p>
          <p className="ant-upload-text">
            {uploading ? "Đang upload..." : "Kéo thả hoặc bấm để upload"}
          </p>
          <p className="ant-upload-hint">
            Ảnh / video lưu vào thư viện — chọn lại bất cứ lúc nào như Strapi.
          </p>
        </Upload.Dragger>

        <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
          <Segmented
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
            options={[
              { label: "Tất cả", value: "all", disabled: accept !== "all" },
              {
                label: "Ảnh",
                value: "image",
                disabled: accept === "video",
              },
              {
                label: "Video",
                value: "video",
                disabled: accept === "image",
              },
            ]}
          />
          <Space>
            <Input.Search
              allowClear
              placeholder="Tìm file..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: 200 }}
            />
            <Button icon={<ReloadOutlined />} onClick={() => void load()}>
              Tải lại
            </Button>
          </Space>
        </Space>

        <Spin spinning={loading || uploading}>
          {visible.length === 0 ? (
            <Empty description="Chưa có file — hãy upload ở trên" />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 12,
              }}
            >
              {visible.map((asset) => {
                const isSelected = selected.has(asset.url);
                return (
                  <div
                    key={asset.path}
                    onClick={() => toggle(asset)}
                    style={{
                      position: "relative",
                      borderRadius: 8,
                      border: isSelected
                        ? "2px solid #2563eb"
                        : "1px solid #e5e7eb",
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: "1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#0f172a0a",
                        position: "relative",
                      }}
                    >
                      {asset.kind === "video" ? (
                        <>
                          <video
                            src={asset.url}
                            muted
                            preload="metadata"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
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
                          alt={asset.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      {isSelected ? (
                        <CheckCircleFilled
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            color: "#2563eb",
                            fontSize: 20,
                            background: "#fff",
                            borderRadius: "50%",
                          }}
                        />
                      ) : null}
                    </div>
                    <div style={{ padding: "6px 8px" }}>
                      <Typography.Text
                        ellipsis
                        style={{ fontSize: 12, display: "block" }}
                      >
                        {asset.name}
                      </Typography.Text>
                      <Space
                        style={{
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                          {formatBytes(asset.size)}
                        </Typography.Text>
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(asset);
                          }}
                        />
                      </Space>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Spin>
      </Space>
    </Modal>
  );
}
