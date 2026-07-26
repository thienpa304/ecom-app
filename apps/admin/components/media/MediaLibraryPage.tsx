"use client";

import { Card } from "antd";
import { MediaLibraryPanel } from "./MediaLibraryPanel";

export function MediaLibraryPage() {
  return (
    <Card>
      <MediaLibraryPanel mode="manage" accept="all" active />
    </Card>
  );
}
