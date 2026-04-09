// MongoDB native client singleton
import { MongoClient, Db } from 'mongodb'

const uri = process.env.DATABASE_URL || ''

const globalForMongo = globalThis as unknown as {
    mongoClient: MongoClient | undefined
}

let client: MongoClient

if (process.env.NODE_ENV === 'production') {
    client = new MongoClient(uri)
} else {
    if (!globalForMongo.mongoClient) {
        globalForMongo.mongoClient = new MongoClient(uri)
    }
    client = globalForMongo.mongoClient
}

export async function getDb(): Promise<Db> {
    await client.connect()
    // DB name is embedded in the URI ("healthiq") - MongoClient picks it up automatically
    return client.db()
}

export async function testConnection(): Promise<boolean> {
    try {
        const db = await getDb()
        await db.command({ ping: 1 })
        console.log('✅ Connected to MongoDB (healthiq) successfully!')
        return true
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error)
        return false
    }
}

export { client }
