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
  Pagination,
  Segmented,
  Space,
  Spin,
  Typography,
  Upload,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@ecom/shared";
import {
  deleteMediaAction,
  listMediaAction,
  uploadMediaAction,
} from "@/lib/actions/media";
import type { MediaAsset } from "@/lib/store";

const MEDIA_PAGE_SIZE = 24;
const EMPTY_URLS: string[] = [];

type Filter = "all" | "image" | "video";

export type MediaLibraryPanelProps = {
  accept?: "image" | "video" | "all";
  multiple?: boolean;
  initialSelectedUrls?: string[];
  /** pick = chọn gắn SP; manage = quản lý thư viện */
  mode?: "pick" | "manage";
  /** Bật/tắt fetch (modal đóng thì false) */
  active?: boolean;
  onSelectionChange?: (selected: MediaAsset[]) => void;
};

function formatBytes(n: number | null) {
  if (n == null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibraryPanel({
  accept = "all",
  multiple = true,
  initialSelectedUrls = EMPTY_URLS,
  mode = "manage",
  active = true,
  onSelectionChange,
}: MediaLibraryPanelProps) {
  const { message, modal } = App.useApp();
  const [filter, setFilter] = useState<Filter>(
    accept === "all" ? "all" : accept,
  );
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);

  const initialKey = initialSelectedUrls.join("\0");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listMediaAction({
        filter: filter === "all" ? "all" : filter,
        page,
        pageSize: MEDIA_PAGE_SIZE,
      });
      setAssets(result.items);
      setTotal(result.total);
    } catch {
      message.error("Không tải được thư viện media");
    } finally {
      setLoading(false);
    }
  }, [filter, message, page]);

  useEffect(() => {
    if (!active) return;
    setFilter(accept === "all" ? "all" : accept);
    setSelected(new Set(initialSelectedUrls));
    setSelectedAssets([]);
    setQuery("");
    setPage(1);
    // initialSelectedUrls via initialKey — avoid [] default identity churn
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialKey captures urls
  }, [active, accept, initialKey]);

  useEffect(() => {
    if (active) void load();
  }, [active, load]);

  useEffect(() => {
    if (!onSelectionChange || mode !== "pick") return;
    onSelectionChange(selectedAssets);
  }, [mode, onSelectionChange, selectedAssets]);

  function toggle(asset: MediaAsset) {
    if (mode !== "pick") return;
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
    setSelectedAssets((prev) => {
      if (multiple) {
        const exists = prev.some((a) => a.url === asset.url);
        if (exists) return prev.filter((a) => a.url !== asset.url);
        return [...prev, asset];
      }
      return [asset];
    });
  }

  const visible = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) || a.path.toLowerCase().includes(q),
    );
  })();

  async function onUpload(files: File[]) {
    if (files.length === 0) return;

    const oversized = files.find((f) => f.size > MAX_UPLOAD_BYTES);
    if (oversized) {
      message.error(
        `File "${oversized.name}" vượt quá ${MAX_UPLOAD_MB}MB. Chọn file nhỏ hơn.`,
      );
      return;
    }

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
      setPage(1);
      await load();
      if (res.urls.length && mode === "pick") {
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

  return (
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
          Ảnh / video lưu vào thư viện — tối đa {MAX_UPLOAD_MB}MB mỗi file.
        </p>
      </Upload.Dragger>

      <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
        <Segmented
          value={filter}
          onChange={(v) => {
            setPage(1);
            setFilter(v as Filter);
          }}
          options={[
            { label: "Tất cả", value: "all", disabled: accept !== "all" },
            { label: "Ảnh", value: "image", disabled: accept === "video" },
            { label: "Video", value: "video", disabled: accept === "image" },
          ]}
        />
        <Space>
          <Input.Search
            allowClear
            placeholder="Tìm trên trang này..."
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
              const selectable = mode === "pick";
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
                    cursor: selectable ? "pointer" : "default",
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
        {total > MEDIA_PAGE_SIZE ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
            <Pagination
              current={page}
              pageSize={MEDIA_PAGE_SIZE}
              total={total}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
              showTotal={(t) => `${t} file`}
            />
          </div>
        ) : null}
      </Spin>
    </Space>
  );
}
