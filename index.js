if(process.env.NODE_env !=="production"){
    require('dotenv').config()
}
const port = process.env.PORT || 3000
const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const path = require("path");
const ejs = require("ejs");
const app = express();
const errorHandler = require("./static/errors");
const { error } = require("console");
const sgMail = require('@sendgrid/mail')
const sendEmail = require('./static/JS/sendEmail')
// const db = require('./db')

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/static")));
app.use(express.json());

// const dbUrl = "mongodb://127.0.0.1:27017/musicBrainz";
const dbUrl = process.env.db_connection_string
const client = new MongoClient(dbUrl);
const dbName = "BTB";

let db;
let artists;
let albums;

async function connectDb() {
	await client.connect();
	db = client.db(dbName);
	artists = db.collection("artists");
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
		const artist = await artists.aggregate(pipeline).toArray();
		res.render('singleArtist', {title: artist.name, artist:artist[0], paginationData: {isVerifiedArtists: true}});
	})
);

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

app.get('/about', errorHandler(async (req,res) => {
	res.render('about', {title: 'About Blank The Blank', paginationData: {isVerifiedArtists: false}})
}))

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

app.get('/contact', errorHandler(async (req,res) =>{
	res.render('contact', {title: 'Contact', paginationData: {isVerifiedArtists: false}})
}))

app.post('/anti-robot', errorHandler(async(req,res) => {
	const {userToken} = req.body
	const verificationObject = {
		response: userToken,
		secret: process.env.captchaSecret
	}
	const verifyWithGoogle = await fetch('https://www.google.com/recaptcha/api/siteverify',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(verificationObject)
	})
	if(verifyWithGoogle.status === 200){
		googleResponse = await verifyWithGoogle.json()
		googleResponse.success === true ? res.status(200).send({msg: 'Token valid'}): res.status(400).send({msg: 'Invalid token.'})
	} else {
		res.status(500).send({msg:'Something went wrong on the server.'})
	}
}))

app.post('/send-email', errorHandler(async (req,res) =>{
	const emailData = req.body
	console.log(emailData)
	const sentEmail = await sendEmail(emailData)
	console.log(sentEmail)
	if(sentEmail.status === 200){
		return res.status(sentEmail.status).send({message: sentEmail.message})
	}
	return res.status(sentEmail.status).send({message: sentEmail.message})
}))

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
		app.listen(port, "0.0.0.0", () => {
			console.log("App is running");
		})
	);
