// A tiny in-memory stand-in for the parts of Firestore (Admin SDK) that the server uses.
// Transactions apply their writes only after the callback finishes, like the real thing.
function clone(value) {
  if (value instanceof Date) return new Date(value.getTime())
  if (Array.isArray(value)) return value.map(clone)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clone(v)]))
  return value // numbers, strings, booleans and functions (e.g. a Timestamp's toDate)
}

export function createFakeDb() {
  const store = new Map()
  let autoId = 0
  const snap = (path) => ({
    exists: store.has(path),
    data: () => (store.has(path) ? clone(store.get(path)) : undefined),
  })

  function docRef(path) {
    return {
      path,
      id: path.split('/').pop(),
      async get() { return snap(path) },
      async set(data) { store.set(path, clone(data)) },
      async update(data) {
        if (!store.has(path)) throw new Error(`NOT_FOUND: ${path}`)
        store.set(path, { ...store.get(path), ...clone(data) })
      },
      collection(name) { return collectionRef(`${path}/${name}`) },
    }
  }

  function collectionRef(path) {
    return {
      doc: (id) => docRef(`${path}/${id}`),
      async add(data) {
        autoId += 1
        const ref = docRef(`${path}/auto${autoId}`)
        await ref.set(data)
        return ref
      },
    }
  }

  return {
    store,
    collection: (name) => collectionRef(name),
    async runTransaction(fn) {
      const writes = []
      const tx = {
        get: async (ref) => snap(ref.path),
        set: (ref, data) => writes.push(() => ref.set(data)),
        update: (ref, data) => writes.push(() => ref.update(data)),
      }
      const result = await fn(tx)
      for (const write of writes) await write()
      return result
    },
  }
}
