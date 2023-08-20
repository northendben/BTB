const { MongoClient, TopologyType, ObjectId } = require("mongodb");
const express = require("express");
const path = require("path");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const errorHandler = require("./static/errors");
const { error } = require("console");
// const db = require('./db')

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/static")));
app.use(express.json());

const dbUrl = "mongodb://127.0.0.1:27017/musicBrainz";
const client = new MongoClient(dbUrl);
const dbName = "musicBrainz";

let db;
let artists;
let albums;
// let artists_copy

async function connectDb() {
	await client.connect();
	db = client.db(dbName);
	artists = db.collection("artists_copy");
	// artists_copy = db.collection('artists_copy')
	albums = db.collection("albums");
}

app.get(
	"/",
	errorHandler(async (req, res, next) => {
		const count = await artists.count({});
		const genres = Array.from(await artists.distinct("genres"));
		const numGenres = genres.length;
		const numAlbums = await albums.count({});
		res.render("main", {
			numArtists: count,
			numGenres: numGenres,
			numAlbums: numAlbums,
			title: "Blank The Blank"
		});
	})
);

app.get(
	"/artists",
	errorHandler(async (req, res) => {
		let numToSkip = 0;
		let pipelineInsertion = { $match: {} };
		let pipeline = [];
		let isVerifiedArtists = false;
		const defaultNumOfPages = 1;
		const { query } = req;
		console.log(query);
		if (Object.keys(query).length > 0) {
			for (let key of Object.keys(query)) {
				if (key == "genre") {
					pipelineInsertion["$match"]["genres"] = { $in: [query[key]] };
				}
				if (key == "verified" && query[key] == "true") {
					isVerifiedArtists = true;
					pipelineInsertion["$match"]["spotify_id"] = { $exists: true };
				}
				if (key == "skip") numToSkip = Number(query["skip"]);
			}
			pipeline.push(pipelineInsertion);
		}
		pipeline.push(
			{
				$sort: {
					name: 1
				}
			},
			{
				$skip: numToSkip
			},
			{
				$limit: 50
			},
			{
				$lookup: {
					from: "albums",
					localField: "_id",
					foreignField: "artist",
					as: "albums",
					pipeline: [
						{
							$addFields: {
								year: {
									$year: {
										$dateFromString: {
											dateString: "$release_date",
											onError: {
												$dateFromString: {
													dateString: {
														$concat: ["$release_date", "-01-01"]
													}
												}
											}
										}
									}
								}
							}
						},
						{
							$project: {
								_id: 1,
								spotify_id: 1,
								type: 1,
								title: 1,
								year: 1
							}
						}
					]
				}
			},
			{
				$addFields: {
					min: { $min: "$albums.year" },
					max: { $max: "$albums.year" }
				}
			}
		);
		const queryDocumentCount = await artists.count(pipelineInsertion["$match"]);
		console.log(queryDocumentCount);
		const artistData = await artists.aggregate(pipeline).toArray();
		let numOfPages = Math.round(queryDocumentCount / 50);
		numOfPages > defaultNumOfPages
			? (numOfPages = numOfPages)
			: (numOfPages = defaultNumOfPages);
		res.render("artists", {
			title: "All artists",
			artists: artistData,
			paginationData: {
				isVerifiedArtists: isVerifiedArtists,
				skip: numToSkip,
				numOfPages: numOfPages,
				currentPage: numToSkip / 50 + 1
			}
		});
	})
);

app.get(
	"/artists/:id",
	errorHandler(async (req, res) => {
		const { id } = req.params;
		const pipeline = [
			{
				$match: {
					_id: new ObjectId(id)
				}
			},
			{ $limit: 1 },
			{
				$lookup: {
					from: "albums",
					localField: "_id",
					foreignField: "artist",
					as: "albums",
					pipeline: [
						{
							$addFields: {
								year: {
									$year: {
										$dateFromString: {
											dateString: "$release_date",
											onError: {
												$dateFromString: {
													dateString: {
														$concat: ["$release_date", "-01-01"]
													}
												}
											}
										}
									}
								}
							}
						},
						{
							$project: {
								_id: 1,
								spotify_id: 1,
								type: 1,
								title: 1,
								year: 1,
								images: 1,
								spotify_uri: 1
							}
						},
						{$sort: {
							year: -1
						}}
					]
				},
			},
			{
				$addFields: {
				min: { $min: "$albums.year" },
				max: { $max: "$albums.year" }
				}
			}
		];
		console.log(id);
		const artist = await artists.aggregate(pipeline).toArray();
		console.log(artist);
		res.render('SpotifyPlay', {title: artist.name, artist:artist[0], paginationData: {isVerifiedArtists: true}});
	})
);

app.get('/spotify', errorHandler(async(req,res)=>{
	let myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
	myHeaders.append("Cookie", "__Host-device_id=AQDe0QMZRc8FbrL2nTQXBcE0gbkPCRfQE9qH_Gr5ugwXiZVti_paKA6bjSj1Lj55tt10kIwOCNjA8R-MGG0omN8h83f56lZfmYM; sp_tr=false");

	let urlencoded = new URLSearchParams();
	urlencoded.append("grant_type", "client_credentials");
	urlencoded.append("client_id", "b26cd71fe3b546f398a5a7b202aa2306");
	urlencoded.append("client_secret", "ec02022d88784af48a1ce14053594f00");

	let requestOptions = {
	method: 'POST',
	headers: myHeaders,
	body: urlencoded,
	redirect: 'follow'
};

	let request = await fetch("https://accounts.spotify.com/api/token", requestOptions)
	console
	if(request.status===200){
		request = await request.json()
		const token = request.access_token
		console.log(typeof(token))
		res.render('SpotifyPlay', {title: 'spotifyPlayGround', paginationData: {isVerifiedArtists: true}, token:token})
	}
}))

app.get(
	"/search/artists",
	errorHandler(async (req, res) => {
		let numToSkip = 0;
		let isVerifiedArtists = false;
		const defaultNumOfPages = 1;
		let { q } = req.query;
		if (Object.keys(req.query).length > 0) {
			for (let key of Object.keys(req.query)) {
				if (key == "skip") numToSkip = Number(req.query["skip"]);
			}
		}
		q = q.toLowerCase();
		let albumSearch = new RegExp(q, "i");
		console.log(albumSearch);
		const pipeline = [
			{
				$match: {
					$or: [
						{ name: { $regex: q, $options: "i" } },
						{ genres: { $in: [q] } }
					]
				}
			},
			{ $skip: numToSkip },
			{ $limit: 50 },
			{
				$sort: { name: 1 }
			},
			{
				$lookup: {
					from: "albums",
					localField: "_id",
					foreignField: "artist",
					as: "albums",
					pipeline: [
						{
							$addFields: {
								year: {
									$year: {
										$dateFromString: {
											dateString: "$release_date",
											onError: {
												$dateFromString: {
													dateString: {
														$concat: ["$release_date", "-01-01"]
													}
												}
											}
										}
									}
								}
							}
						},
						{
							$project: {
								_id: 1,
								spotify_id: 1,
								type: 1,
								title: 1,
								year: 1
							}
						}
					]
				}
			},
			{
				$addFields: {
					min: { $min: "$albums.year" },
					max: { $max: "$albums.year" }
				}
			}
		];
		const numFoundItems = await artists.count({
			$or: [{ name: { $regex: q, $options: "i" } }, { genres: { $in: [q] } }]
		});
		const foundItems = await artists.aggregate(pipeline).toArray();
		let numOfPages = Math.round(numFoundItems / 50);
		numOfPages > defaultNumOfPages
			? (numOfPages = numOfPages)
			: (numOfPages = defaultNumOfPages);
		res.render("searchresults", {
			artists: foundItems,
			title: "All artists",
			paginationData: {
				isVerifiedArtists: isVerifiedArtists,
				skip: numToSkip,
				numOfPages: numOfPages,
				currentPage: numToSkip / 50 + 1
			},
			currentQuery: q
		});
	})
);

// app.get('/databaseclean', async (req,res) => {
// 	const dupes = await artists_copy.aggregate([{$group: {_id: '$name', 'count': {$sum: 1}}}, {$match: {'count': {$gt: 1}}}]).toArray()
// 	let namesToChange = []
// 	for(let dupe of dupes){
// 		namesToChange.push(dupe._id)
// 	}
// 	console.log(namesToChange.length, namesToChange)
// 	const updates = await artists_copy.updateMany({'name': {$in:namesToChange}}, {$set: {spotify_id: null, genres: null, popularity: null, images: null}})
// 	res.send(updates)
// })

app.all("*", async (req, res, next) => {
	res.render("errors", {
		name: 404,
		message: "That page does not exist",
		title: "Blank The Blank- Errors"
	});
});

app.use((err, req, res, next) => {
	const message = err.message;
	const name = err.name;
	console.log(message);
	res.render("errors", {
		title: "Blank The Blank- Error",
		name: name,
		message: message
	});
});

connectDb()
	.then(console.log("DB Connected"))
	.catch((e) => console.log(e))
	.then(() =>
		app.listen(3000, () => {
			console.log("App is running");
			console.log("hey");
		})
	);

// app.get('/mongoose', async (req,res) => {
//     const db = await mongoose.connect(dbUrl)
//     const result = await db.connection.collection('artists').find({}).toArray()
//     res.send(result)

// })

// main().catch(err => console.log(err, 'Your connection failed'));
// async function main() {
//     // await mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
//     await mongoose.connect(dbUrl)
//     console.log('Connected')
// }
// main()
