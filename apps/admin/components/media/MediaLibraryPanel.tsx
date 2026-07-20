"use client";

import {
  CheckCircleFilled,
  CloudUploadOutlined,
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Checkbox,
  Empty,
  Input,
  Modal,
  Pagination,
  Segmented,
  Space,
  Spin,
  Typography,
  Upload,
  theme,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@ecom/shared";
import {
  deleteMediaAction,
  deleteMediaBulkAction,
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

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
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
  const { token } = theme.useToken();
  const [filter, setFilter] = useState<Filter>(
    accept === "all" ? "all" : accept,
  );
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);
  /** manage-mode multi-select by path */
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<MediaAsset | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const initialKey = initialSelectedUrls.join("\0");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listMediaAction({
        filter: filter === "all" ? "all" : filter,
        q: debouncedQuery.trim() || undefined,
        page,
        pageSize: MEDIA_PAGE_SIZE,
      });
      setAssets(result.items);
      setTotal(result.total);
      if (result.total > 0 && result.items.length === 0 && page > 1) {
        setPage(1);
      }
    } catch {
      message.error("Không tải được thư viện media");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filter, message, page]);

  useEffect(() => {
    if (!active) return;
    setFilter(accept === "all" ? "all" : accept);
    setSelected(new Set(initialSelectedUrls));
    setSelectedAssets([]);
    setChecked(new Set());
    setQuery("");
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialKey captures urls
  }, [active, accept, initialKey]);

  useEffect(() => {
    if (active) void load();
  }, [active, load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filter]);

  useEffect(() => {
    if (!onSelectionChange || mode !== "pick") return;
    onSelectionChange(selectedAssets);
  }, [mode, onSelectionChange, selectedAssets]);

  function togglePick(asset: MediaAsset) {
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

  function toggleChecked(asset: MediaAsset, nextChecked?: boolean) {
    setChecked((prev) => {
      const next = new Set(prev);
      const shouldCheck =
        nextChecked != null ? nextChecked : !next.has(asset.path);
      if (shouldCheck) next.add(asset.path);
      else next.delete(asset.path);
      return next;
    });
  }

  function onCardClick(asset: MediaAsset) {
    if (mode === "pick") {
      togglePick(asset);
      return;
    }
    setPreview(asset);
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      message.success("Đã copy URL");
    } catch {
      message.error("Không copy được URL");
    }
  }

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
      setUploadOpen(false);
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
        setChecked((prev) => {
          const next = new Set(prev);
          next.delete(asset.path);
          return next;
        });
        await load();
      },
    });
  }

  function onBulkDelete() {
    const paths = [...checked];
    if (paths.length === 0) return;
    modal.confirm({
      title: `Xóa ${paths.length} file đã chọn?`,
      content: "Thao tác này không hoàn tác được.",
      okText: "Xóa hết",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        const res = await deleteMediaBulkAction(paths);
        if (!res.ok) {
          message.error(res.error ?? "Xóa thất bại");
          return;
        }
        message.success(`Đã xóa ${res.deleted ?? paths.length} file`);
        setChecked(new Set());
        await load();
      },
    });
  }

  function selectAllOnPage() {
    setChecked((prev) => {
      const next = new Set(prev);
      for (const a of assets) next.add(a.path);
      return next;
    });
  }

  function clearChecked() {
    setChecked(new Set());
  }

  const pageCheckedCount = assets.filter((a) => checked.has(a.path)).length;
  const allPageChecked =
    assets.length > 0 && pageCheckedCount === assets.length;

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={() => setUploadOpen(true)}
          >
            Upload
          </Button>
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
        </Space>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="Tìm toàn thư viện..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 220 }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => void load()}>
            Tải lại
          </Button>
        </Space>
      </Space>

      {mode === "manage" ? (
        <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
          <Space>
            <Checkbox
              checked={allPageChecked}
              indeterminate={pageCheckedCount > 0 && !allPageChecked}
              disabled={assets.length === 0}
              onChange={(e) => {
                if (e.target.checked) selectAllOnPage();
                else clearChecked();
              }}
            >
              Chọn trang này
            </Checkbox>
            {checked.size > 0 ? (
              <Typography.Text type="secondary">
                Đã chọn {checked.size} file
              </Typography.Text>
            ) : null}
          </Space>
          <Space>
            {checked.size > 0 ? (
              <>
                <Button onClick={clearChecked}>Bỏ chọn</Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={onBulkDelete}
                >
                  Xóa {checked.size} file
                </Button>
              </>
            ) : null}
          </Space>
        </Space>
      ) : null}

      <Spin spinning={loading || uploading}>
        {assets.length === 0 ? (
          <Empty
            description={
              debouncedQuery.trim()
                ? "Không tìm thấy file khớp"
                : "Chưa có file — hãy upload ở trên"
            }
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            {assets.map((asset) => {
              const isPickSelected = selected.has(asset.url);
              const isChecked = checked.has(asset.path);
              const selectable = mode === "pick";
              const highlight =
                (selectable && isPickSelected) ||
                (mode === "manage" && isChecked);
              return (
                <div
                  key={asset.path}
                  onClick={() => onCardClick(asset)}
                  style={{
                    position: "relative",
                    borderRadius: 8,
                    border: highlight
                      ? `2px solid ${token.colorPrimary}`
                      : `1px solid ${token.colorBorderSecondary}`,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: token.colorFillAlter,
                  }}
                >
                  <div
                    style={{
                      aspectRatio: "1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: token.colorFillTertiary,
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
                    {isPickSelected ? (
                      <CheckCircleFilled
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          color: token.colorPrimary,
                          fontSize: 20,
                          background: "#fff",
                          borderRadius: "50%",
                        }}
                      />
                    ) : null}
                    {mode === "manage" ? (
                      <Checkbox
                        checked={isChecked}
                        aria-label={`Chọn ${asset.name}`}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          toggleChecked(asset, e.target.checked)
                        }
                        style={{
                          position: "absolute",
                          top: 6,
                          left: 6,
                          background: "rgba(255,255,255,0.92)",
                          borderRadius: 4,
                          padding: 2,
                        }}
                      />
                    ) : null}
                    {selectable ? (
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        aria-label="Xem trước"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreview(asset);
                        }}
                        style={{
                          position: "absolute",
                          top: 4,
                          left: 4,
                          background: "rgba(255,255,255,0.9)",
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
                      <Space size={0}>
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          aria-label="Copy URL"
                          onClick={(e) => {
                            e.stopPropagation();
                            void copyUrl(asset.url);
                          }}
                        />
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
                    </Space>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {total > 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 16,
            }}
          >
            <Pagination
              current={page}
              pageSize={MEDIA_PAGE_SIZE}
              total={total}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
              hideOnSinglePage={false}
              showTotal={(t, range) => `${range[0]}–${range[1]} / ${t} file`}
            />
          </div>
        ) : null}
      </Spin>

      <Modal
        open={uploadOpen}
        onCancel={() => {
          if (!uploading) setUploadOpen(false);
        }}
        title="Upload media"
        footer={null}
        destroyOnHidden
        centered
        maskClosable={!uploading}
        width={520}
      >
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
      </Modal>

      <Modal
        open={preview != null}
        onCancel={() => setPreview(null)}
        title={preview?.name}
        footer={
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Space>
              <Typography.Text type="secondary">
                {preview ? formatBytes(preview.size) : ""}
              </Typography.Text>
              {preview ? (
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => void copyUrl(preview.url)}
                >
                  Copy URL
                </Button>
              ) : null}
            </Space>
            <Button type="primary" onClick={() => setPreview(null)}>
              Đóng
            </Button>
          </Space>
        }
        width={920}
        centered
        destroyOnHidden
        styles={{
          body: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 320,
            background: "#0f172a",
            padding: 16,
          },
        }}
      >
        {preview?.kind === "video" ? (
          <video
            key={preview.url}
            src={preview.url}
            controls
            autoPlay
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              background: "#000",
            }}
          />
        ) : preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview.url}
            alt={preview.name}
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
            }}
          />
        ) : null}
      </Modal>
    </Space>
  );
}
