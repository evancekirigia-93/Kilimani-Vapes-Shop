/* Large browser drafts belong in IndexedDB; retain legacy drafts until migrated. */
window.KilimaniDrafts = (() => {
  const key = 'kilimani-config';
  function database() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('kilimani-drafts', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('drafts');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function write(value) {
    const db = await database();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction('drafts', 'readwrite');
        tx.objectStore('drafts').put(value, key);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || Error('Draft save interrupted.'));
      });
    } finally { db.close(); }
    // Remove the old copy only after the replacement has committed successfully.
    try { localStorage.removeItem(key); } catch {}
  }
  async function read() {
    let value;
    try {
      const db = await database();
      try {
        value = await new Promise((resolve, reject) => {
          const request = db.transaction('drafts').objectStore('drafts').get(key);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } finally { db.close(); }
    } catch {}
    if (value) return value;
    let legacy;
    try { legacy = JSON.parse(localStorage.getItem(key)); } catch {}
    if (legacy) { try { await write(legacy); } catch {} }
    return legacy;
  }
  return {read, write};
})();
