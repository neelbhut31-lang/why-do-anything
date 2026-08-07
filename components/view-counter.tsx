"use client";

import { useEffect } from "react";

export function ViewCounter({ pageId }: { pageId: string }) {
  useEffect(() => {
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pageId }),
    }).catch(() => {});
  }, [pageId]);

  return null;
}
