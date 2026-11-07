const databaseName = "bitrouter-playground";
const storeName = "sessions";
const savedSession = "preview-v1";

async function withSession<T>(mode: IDBTransactionMode, request: (store: IDBObjectStore) => IDBRequest<T>) {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const open = indexedDB.open(databaseName, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(storeName);
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(storeName, mode);
      const operation = request(transaction.objectStore(storeName));
      transaction.oncomplete = () => resolve(operation.result);
      transaction.onabort = () => reject(transaction.error ?? new Error("Playground storage transaction aborted."));
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export function savePlaygroundSession<T>(value: T) {
  return withSession("readwrite", (store) => store.put(value, savedSession));
}

export function loadPlaygroundSession<T>(): Promise<T | undefined> {
  return withSession("readonly", (store) => store.get(savedSession));
}

export function removePlaygroundSession() {
  return withSession("readwrite", (store) => store.delete(savedSession));
}
