import Dexie from 'dexie'

export const db = new Dexie('memoDB')

db.version(1).stores({
    memos: '++id, createdAt'
})