import type { ReactElement } from "react";
import { FlatList } from "react-native";

import { EmptyState } from "@/components/molecules/EmptyState";
import { ErrorState } from "@/components/molecules/ErrorState";
import { LoadingPanel } from "@/components/organisms/LoadingPanel";

export type FunctionalListStatus = "loading" | "empty" | "error" | "success";

export interface FunctionalListProps<T> {
  /** Explicit request state — never derived from `data` (VS1, docs/motus/feature-backlog.md). */
  status: FunctionalListStatus;
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactElement;
  loadingMessage?: string;
  emptyMessage: string;
  errorMessage?: string;
  onRetry?: () => void;
  onEndReached?: () => void;
  testID?: string;
}

/**
 * State-driven list container shared by every "list with filters" screen
 * (S01/S02/S04, architecture.md §3): renders exactly one of
 * loading/empty/error/populated for the `status` prop it is given, so the
 * calling feature stays the single source of truth for request state.
 */
export function FunctionalList<T>({
  status,
  data,
  keyExtractor,
  renderItem,
  loadingMessage,
  emptyMessage,
  errorMessage,
  onRetry,
  onEndReached,
  testID,
}: FunctionalListProps<T>) {
  if (status === "loading") {
    return <LoadingPanel message={loadingMessage} />;
  }

  if (status === "error") {
    return (
      <ErrorState
        message={errorMessage ?? "Si è verificato un errore."}
        onRetry={onRetry}
      />
    );
  }

  if (status === "empty") {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <FlatList
      testID={testID}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => renderItem(item)}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      className="flex-1"
    />
  );
}
