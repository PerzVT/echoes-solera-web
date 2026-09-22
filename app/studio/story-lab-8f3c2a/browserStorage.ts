// Media stays in this browser. Object URLs are recreated each time the demo opens.
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("story-lab", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("media");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function storeMedia(id: string, file: Blob): Promise<void> {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("media", "readwrite");
      transaction.objectStore("media").put(file, id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error("Upload could not be saved in this browser."));
    });
  } finally { db.close(); }
}
export async function readMedia(id: string): Promise<Blob | undefined> {
  const db = await database();
  try {
    return await new Promise<Blob | undefined>((resolve, reject) => {
      const request = db.transaction("media", "readonly").objectStore("media").get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
