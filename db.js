const { MongoClient } = require("mongodb");
const dbUrl = "mongodb://127.0.0.1:27017";
const dbName = "musicBrainz";
const client = new MongoClient(dbUrl)

let db
let artists

module.exports = {
    connectToServer: async (callback) => {
        await client.connect()
        console.log('Connected')
        db = client.db(dbName)
        artists = db.collection('artists')
        console.log('Connected to Mongo')
    },
    getDb: function () {
        return db
    },
    getArtists: function (){
        return artists
    }
}

// module.exports = {db: async function connectDb() {
// 	await client.connect();
//     db = client.db(dbName);
//     artists = db.collection('artists')
//     return {db,artists}
//     // const all_artists = await artists.find({}).toArray()
//     // console.log(all_artists)
// }}


// module.exports = {
//     connectToDb: (cb) => {
//         MongoClient.connect(dbUrl).then((client) =>{
//             db = client.db()
//             return cb()
//         })
//     },
// getDb: () => db
// }



