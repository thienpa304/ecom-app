"use client";

import { CloudUploadOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Checkbox,
  Empty,
  Flex,
  Input,
  Pagination,
  Segmented,
  Spin,
  Typography,
} from "antd";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  checkMediaUsageAction,
  deleteMediaBulkAction,
  listMediaAction,
  renameMediaAction,
  uploadMediaAction,
} from "@/lib/actions/media";
import type { MediaAsset, MediaUsage } from "@/lib/media-store";
import { MediaCard } from "./MediaCard";
import { MediaPreviewModal } from "./MediaPreviewModal";
import { MediaUploadModal } from "./MediaUploadModal";
import { RenameMediaModal } from "./RenameMediaModal";
import { displayName } from "./mediaUtils";
import { useDebouncedValue } from "./useDebouncedValue";

const MEDIA_PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;
const EMPTY_URLS: string[] = [];

type Filter = "all" | "image" | "video";

export type MediaLibraryPanelProps = {
  accept?: "image" | "video" | "all";
  multiple?: boolean;
  initialSelectedUrls?: string[];
  mode?: "pick" | "manage";
  active?: boolean;
  onSelectionChange?: (selected: MediaAsset[]) => void;
};

function UsageWarning({ usage }: { usage: MediaUsage[] }) {
  return (
    <div>
      <Typography.Paragraph style={{ marginBottom: 8 }}>
        Xóa sẽ đồng thời <b>bỏ ảnh/video này khỏi các sản phẩm bên dưới</b>. Nếu
        không, trang web sẽ hiện ảnh lỗi.
      </Typography.Paragraph>
      <ul
        style={{ margin: 0, paddingLeft: 18, maxHeight: 220, overflow: "auto" }}
      >
        {usage.map((item) => (
          <li key={item.path} style={{ marginBottom: 4 }}>
            <Typography.Text code style={{ fontSize: 12 }}>
              {item.path}
            </Typography.Text>
            <div style={{ fontSize: 12 }}>
              {[...new Set(item.refs.map((r) => r.productName))].join(", ")}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
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
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<MediaAsset | null>(null);
  const [renaming, setRenaming] = useState<MediaAsset | null>(null);
  const [savingLabel, setSavingLabel] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [checkingUsage, setCheckingUsage] = useState(false);

  const initialKey = initialSelectedUrls.join("\0");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listMediaAction({
        filter,
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
    setSelected((prev) => {
      const next = multiple ? new Set(prev) : new Set<string>();
      if (multiple && prev.has(asset.url)) next.delete(asset.url);
      else next.add(asset.url);
      return next;
    });
    setSelectedAssets((prev) => {
      if (!multiple) return [asset];
      if (prev.some((a) => a.url === asset.url)) {
        return prev.filter((a) => a.url !== asset.url);
      }
      return [...prev, asset];
    });
  }

  function toggleChecked(asset: MediaAsset, nextChecked: boolean) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (nextChecked) next.add(asset.path);
      else next.delete(asset.path);
      return next;
    });
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      message.success("Đã copy URL");
    } catch {
      message.error("Không copy được URL");
    }
  }

  async function onUpload(files: File[], label: string) {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const fd = new FormData();
      for (const file of files) fd.append("files", file);
      if (label.trim()) fd.append("label", label.trim());

      const res = await uploadMediaAction(fd);
      if (res.error) {
        message.error(res.error);
        return;
      }

      message.success(`Đã upload ${res.urls.length} file`);
      setUploadOpen(false);
      setPage(1);
      await load();

      if (res.urls.length > 0 && mode === "pick") {
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

  async function onRenameSubmit(label: string) {
    if (!renaming) return;

    setSavingLabel(true);
    try {
      const res = await renameMediaAction(renaming.path, label);
      if (!res.ok) {
        message.error(res.error ?? "Không lưu được tên file");
        return;
      }
      message.success("Đã đổi tên");
      setRenaming(null);
      setPreview(null);
      await load();
    } finally {
      setSavingLabel(false);
    }
  }

  async function requestDelete(
    paths: string[],
    fallbackContent: ReactNode,
    afterDelete: () => void,
  ) {
    if (paths.length === 0) return;

    setCheckingUsage(true);
    let usage: MediaUsage[];
    try {
      const res = await checkMediaUsageAction(paths);
      if (res.error) {
        message.error(res.error);
        return;
      }
      usage = res.usage;
    } finally {
      setCheckingUsage(false);
    }

    const inUse = usage.length > 0;
    modal.confirm({
      title: inUse
        ? `${usage.length}/${paths.length} file đang được sản phẩm sử dụng — vẫn xóa?`
        : paths.length === 1
          ? "Xóa file này?"
          : `Xóa ${paths.length} file đã chọn?`,
      width: inUse ? 520 : undefined,
      content: inUse ? <UsageWarning usage={usage} /> : fallbackContent,
      okText: inUse ? "Vẫn xóa & bỏ khỏi sản phẩm" : "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        const res = await deleteMediaBulkAction(paths, { force: inUse });
        if (!res.ok) {
          message.error(
            res.inUse?.length
              ? "File vừa được gắn vào sản phẩm khác — hãy thử lại."
              : (res.error ?? "Xóa thất bại"),
          );
          return;
        }
        message.success(
          res.referencesRemoved
            ? `Đã xóa ${res.deleted} file và bỏ khỏi ${res.referencesRemoved} vị trí trong sản phẩm`
            : `Đã xóa ${res.deleted ?? paths.length} file`,
        );
        afterDelete();
        await load();
      },
    });
  }

  function onDelete(asset: MediaAsset) {
    void requestDelete([asset.path], displayName(asset), () => {
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
    });
  }

  function onBulkDelete() {
    void requestDelete([...checked], "Thao tác này không hoàn tác được.", () =>
      setChecked(new Set()),
    );
  }

  const pageCheckedCount = assets.filter((a) => checked.has(a.path)).length;
  const allPageChecked = assets.length > 0 && pageCheckedCount === assets.length;

  return (
    <Flex vertical gap="middle" style={{ width: "100%" }}>
      <Flex wrap gap={8} justify="space-between">
        <Flex wrap gap={8}>
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
        </Flex>
        <Flex wrap gap={8}>
          <Input.Search
            allowClear
            placeholder="Tìm theo tên file..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 220 }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => void load()}>
            Tải lại
          </Button>
        </Flex>
      </Flex>

      {mode === "manage" ? (
        <Flex wrap gap={8} justify="space-between" align="center">
          <Flex align="center" gap={8}>
            <Checkbox
              checked={allPageChecked}
              indeterminate={pageCheckedCount > 0 && !allPageChecked}
              disabled={assets.length === 0}
              onChange={(e) => {
                if (!e.target.checked) {
                  setChecked(new Set());
                  return;
                }
                setChecked((prev) => {
                  const next = new Set(prev);
                  for (const a of assets) next.add(a.path);
                  return next;
                });
              }}
            >
              Chọn trang này
            </Checkbox>
            {checked.size > 0 ? (
              <Typography.Text type="secondary">
                Đã chọn {checked.size} file
              </Typography.Text>
            ) : null}
          </Flex>
          {checked.size > 0 ? (
            <Flex gap={8}>
              <Button onClick={() => setChecked(new Set())}>Bỏ chọn</Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={checkingUsage}
                onClick={onBulkDelete}
              >
                Xóa {checked.size} file
              </Button>
            </Flex>
          ) : null}
        </Flex>
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
            {assets.map((asset) => (
              <MediaCard
                key={asset.path}
                asset={asset}
                mode={mode}
                isPickSelected={selected.has(asset.url)}
                isChecked={checked.has(asset.path)}
                busy={checkingUsage}
                onOpen={() =>
                  mode === "pick" ? togglePick(asset) : setPreview(asset)
                }
                onPreview={() => setPreview(asset)}
                onToggleChecked={(next) => toggleChecked(asset, next)}
                onCopyUrl={() => void copyUrl(asset.url)}
                onRename={() => setRenaming(asset)}
                onDelete={() => onDelete(asset)}
              />
            ))}
          </div>
        )}

        {total > 0 ? (
          <Flex justify="center" style={{ marginTop: 16 }}>
            <Pagination
              current={page}
              pageSize={MEDIA_PAGE_SIZE}
              total={total}
              onChange={setPage}
              showSizeChanger={false}
              hideOnSinglePage={false}
              showTotal={(t, range) => `${range[0]}–${range[1]} / ${t} file`}
            />
          </Flex>
        ) : null}
      </Spin>

      <MediaUploadModal
        open={uploadOpen}
        uploading={uploading}
        multiple={multiple || accept !== "video"}
        accept={accept}
        onCancel={() => {
          if (!uploading) setUploadOpen(false);
        }}
        onUpload={(files, label) => void onUpload(files, label)}
      />

      <MediaPreviewModal
        asset={preview}
        onClose={() => setPreview(null)}
        onCopyUrl={(url) => void copyUrl(url)}
        onRename={(asset) => setRenaming(asset)}
      />

      <RenameMediaModal
        asset={renaming}
        saving={savingLabel}
        onCancel={() => {
          if (!savingLabel) setRenaming(null);
        }}
        onSubmit={(label) => void onRenameSubmit(label)}
      />
    </Flex>
  );
}
