db.collection.aggregate([
    {$}
])

db.albums.aggregate ([
    {
        $addFields: {
            mydate: {$year: new Date('$release_date')}
        }
    },
        {$group: {
            _id: null,
            avgyear: { $avg: '$mydate'}
        }
        }
])

db.albums.find({'release_date'})

db.artists.aggregate([
    {
        $match: {'name': {$regex: /^[a-f]/i}}
    },
    {
        $sort: {'name': 1}
    },
    {
        $limit: 25
    }
])

db.artists.aggregate([
    {
        $match: {'name': {$regex: /^[a-f]/i}}
    },
    {
        $sort: {'popularity': -1}
    },
    {
        $limit: 25
    }
])

db.artists.aggregate([
    {
        $sort: {'popularity': -1}
    },
    {
        $limit: 25
    }
])

db.artists.aggregate([
    {
        $project:{
            genres: 1
        }
    },
    {
        $unwind: "$genres"
    },
    {
    $group: {
        _id: '$genres',
        genres: {$sum: 1}
        
    }
    },
    {
    $sort: {
        genres: -1
    }
    }
])

db.artists.aggregate([
    {
        $sort: {'name': 1}
    },
    {
        $limit: 25
    }
])