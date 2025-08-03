export interface LocalStorageMetadata {
  timestamp: number;
  previous_timestamp: number;
  force_refresh?: boolean;
  deleted_keys?: string[];
}

export interface LocalStoragePayload {
  _local_storage: Record<string, string | null>;
  _metadata: LocalStorageMetadata;
}
