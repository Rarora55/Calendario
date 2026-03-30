type VersionedRecord = {
  updatedAt: string;
  deletedAt: string | null;
};

export function resolveMostRecentRecord<T extends VersionedRecord>(localRecord: T, remoteRecord: T) {
  const localTime = new Date(localRecord.updatedAt).getTime();
  const remoteTime = new Date(remoteRecord.updatedAt).getTime();

  if (remoteTime >= localTime) {
    return remoteRecord;
  }

  return localRecord;
}
