const { MongoClient } = require('mongodb')

const dbUrl = 'mongodb://127.0.0.1:27017'
const client = new MongoClient(dbUrl)
const dbName = 'musicBrainz'

export const db = async () => {
    await client.connect()
    return client.db(dbName)
}