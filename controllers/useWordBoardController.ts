"use client";

import { useEffect, useRef, useState } from "react";
import { WordGroupColor, WordTile, wordBoardMock } from "@/models/word-board";

const MAX_SELECTED_WORDS = 4;
const WRONG_SELECTION_FEEDBACK_MS = 420;
const CORRECT_SELECTION_FEEDBACK_MS = 360;

function moveItem<T>(list: T[], from: number, to: number) {
  if (from === to) {
    return list;
  }

  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function shuffleList<T>(list: T[]) {
  const copy = [...list];
  let seed = 20260826;

  function nextRandom() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(nextRandom() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

const groupColorById = new Map(
  wordBoardMock.groups.map((group) => [group.id, group.color] as const),
);

const groupById = new Map(
  wordBoardMock.groups.map((group) => [group.id, group] as const),
);

export function useWordBoardController() {
  const [tiles, setTiles] = useState<WordTile[]>(() => shuffleList(wordBoardMock.words));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [invalidIds, setInvalidIds] = useState<Set<string>>(new Set());
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set());
  const [solvedGroupIds, setSolvedGroupIds] = useState<Set<string>>(new Set());
  const [solvedGroupOrder, setSolvedGroupOrder] = useState<string[]>([]);
  const [isResolvingSelection, setIsResolvingSelection] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);
  const [overTileId, setOverTileId] = useState<string | null>(null);
  const wrongSelectionTimeoutRef = useRef<number | null>(null);

  function clearWrongSelectionTimeout() {
    if (wrongSelectionTimeoutRef.current !== null) {
      window.clearTimeout(wrongSelectionTimeoutRef.current);
      wrongSelectionTimeoutRef.current = null;
    }
  }

  function startWrongSelectionFeedback(ids: Set<string>) {
    setIsResolvingSelection(true);
    setInvalidIds(new Set(ids));
    setCorrectIds(new Set());
    clearWrongSelectionTimeout();

    wrongSelectionTimeoutRef.current = window.setTimeout(() => {
      setSelectedIds(new Set());
      setInvalidIds(new Set());
      setCorrectIds(new Set());
      setIsResolvingSelection(false);
      wrongSelectionTimeoutRef.current = null;
    }, WRONG_SELECTION_FEEDBACK_MS);
  }

  function startCorrectSelectionFeedback(groupId: string, ids: Set<string>) {
    setIsResolvingSelection(true);
    setCorrectIds(new Set(ids));
    setInvalidIds(new Set());
    clearWrongSelectionTimeout();

    wrongSelectionTimeoutRef.current = window.setTimeout(() => {
      setSolvedGroupIds((current) => {
        const next = new Set(current);
        next.add(groupId);
        return next;
      });

      setSolvedGroupOrder((current) => {
        if (current.includes(groupId)) {
          return current;
        }

        return [...current, groupId];
      });

      setSelectedIds(new Set());
      setCorrectIds(new Set());
      setIsResolvingSelection(false);
      wrongSelectionTimeoutRef.current = null;
    }, CORRECT_SELECTION_FEEDBACK_MS);
  }

  useEffect(() => {
    return () => {
      clearWrongSelectionTimeout();
    };
  }, []);

  function isTileSolved(tileId: string) {
    const tile = tiles.find((item) => item.id === tileId);

    if (!tile) {
      return false;
    }

    return solvedGroupIds.has(tile.groupId);
  }

  function getTileSolvedColor(tileId: string): WordGroupColor | null {
    const tile = tiles.find((item) => item.id === tileId);

    if (!tile || !solvedGroupIds.has(tile.groupId)) {
      return null;
    }

    return groupColorById.get(tile.groupId) ?? null;
  }

  function resolveSelection(nextSelectedIds: Set<string>) {
    const selectedTiles = tiles.filter((tile) => nextSelectedIds.has(tile.id));
    const [firstTile] = selectedTiles;

    if (!firstTile) {
      return;
    }

    const sameGroup = selectedTiles.every((tile) => tile.groupId === firstTile.groupId);

    if (sameGroup) {
      startCorrectSelectionFeedback(firstTile.groupId, nextSelectedIds);
      return;
    }

    setErrorCount((current) => current + 1);
    startWrongSelectionFeedback(nextSelectedIds);
  }

  function toggleTile(tileId: string) {
    if (isResolvingSelection) {
      return;
    }

    if (isTileSolved(tileId)) {
      return;
    }

    const next = new Set(selectedIds);

    if (next.has(tileId)) {
      next.delete(tileId);
    } else {
      if (next.size >= MAX_SELECTED_WORDS) {
        return;
      }

      next.add(tileId);
    }

    setSelectedIds(next);

    if (next.size === MAX_SELECTED_WORDS) {
      resolveSelection(next);
    }
  }

  function onDragStart(tileId: string) {
    if (isResolvingSelection || isTileSolved(tileId)) {
      return;
    }

    setDraggedTileId(tileId);
  }

  function onDragEnter(tileId: string) {
    setOverTileId(tileId);
  }

  function onDragEnd() {
    setDraggedTileId(null);
    setOverTileId(null);
  }

  function onDrop(targetTileId: string) {
    if (draggedTileId === null) {
      return;
    }

    const draggedIndex = tiles.findIndex((tile) => tile.id === draggedTileId);
    const targetIndex = tiles.findIndex((tile) => tile.id === targetTileId);
    const draggedTile = draggedIndex >= 0 ? tiles[draggedIndex] : null;
    const targetTile = targetIndex >= 0 ? tiles[targetIndex] : null;

    if (!draggedTile || !targetTile || isTileSolved(draggedTile.id) || isTileSolved(targetTile.id)) {
      setDraggedTileId(null);
      setOverTileId(null);
      return;
    }

    setTiles((current) => moveItem(current, draggedIndex, targetIndex));
    setDraggedTileId(null);
    setOverTileId(null);
  }

  const unsolvedTiles = tiles.filter((tile) => !solvedGroupIds.has(tile.groupId));

  const solvedGroups = solvedGroupOrder
    .map((groupId) => {
      const group = groupById.get(groupId);

      if (!group) {
        return null;
      }

      const groupTiles = wordBoardMock.words.filter((tile) => tile.groupId === groupId);

      return {
        id: group.id,
        title: group.title,
        connection: group.connection,
        color: group.color,
        words: groupTiles.map((tile) => tile.label),
      };
    })
    .filter((group): group is NonNullable<typeof group> => Boolean(group));

  return {
    board: wordBoardMock,
    unsolvedTiles,
    solvedGroups,
    errorCount,
    selectedIds,
    invalidIds,
    correctIds,
    isResolvingSelection,
    draggedTileId,
    overTileId,
    getTileSolvedColor,
    isTileSolved,
    toggleTile,
    onDragStart,
    onDragEnter,
    onDragEnd,
    onDrop,
  };
}