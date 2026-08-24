"use client";

import { useState } from "react";
import { WordTile, wordBoardMock } from "@/models/word-board";

function moveItem<T>(list: T[], from: number, to: number) {
  if (from === to) {
    return list;
  }

  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function useWordBoardController() {
  const [tiles, setTiles] = useState<WordTile[]>(wordBoardMock.words);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function toggleTile(tileId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(tileId)) {
        next.delete(tileId);
      } else {
        next.add(tileId);
      }

      return next;
    });
  }

  function onDragStart(index: number) {
    setDraggedIndex(index);
  }

  function onDragEnter(index: number) {
    setOverIndex(index);
  }

  function onDragEnd() {
    setDraggedIndex(null);
    setOverIndex(null);
  }

  function onDrop(index: number) {
    if (draggedIndex === null) {
      return;
    }

    setTiles((current) => moveItem(current, draggedIndex, index));
    setDraggedIndex(null);
    setOverIndex(null);
  }

  return {
    board: wordBoardMock,
    tiles,
    selectedIds,
    draggedIndex,
    overIndex,
    toggleTile,
    onDragStart,
    onDragEnter,
    onDragEnd,
    onDrop,
  };
}