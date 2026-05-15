"use client";

import { useEffect, useState } from "react";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { isBookmarked, toggleBookmark, subscribeBookmarks, type Bookmark } from "@/lib/bookmarks";

export default function BookmarkButton(props: Omit<Bookmark, "pinnedAt">) {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    setPinned(isBookmarked(props.roadmap, props.topicId));
    return subscribeBookmarks(() => setPinned(isBookmarked(props.roadmap, props.topicId)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.roadmap, props.topicId]);

  function click(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    toggleBookmark(props);
  }

  return (
    <button
      onClick={click}
      title={pinned ? "Remove bookmark" : "Bookmark this topic"}
      className={`p-1.5 rounded-lg transition-colors ${pinned ? "text-amber-300" : "hover:text-amber-300"}`}
      style={{ color: pinned ? undefined : "var(--text-muted)" }}
    >
      {pinned ? <BookmarkSolid className="w-4 h-4" /> : <BookmarkOutline className="w-4 h-4" />}
    </button>
  );
}
