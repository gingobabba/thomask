// Replicates the artifact `window.storage` key-value API on top of localStorage,
// so the component runs unchanged outside the Claude artifact sandbox.
const KEY_PREFIX = "thomask:";

if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      const raw = localStorage.getItem(KEY_PREFIX + key);
      return raw === null ? null : { key, value: raw };
    },
    async set(key, value) {
      localStorage.setItem(KEY_PREFIX + key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(KEY_PREFIX + key);
      return { key, deleted: true };
    },
    async list(prefix = "") {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(KEY_PREFIX + prefix)) keys.push(k.slice(KEY_PREFIX.length));
      }
      return { keys };
    },
  };
}
