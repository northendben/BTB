const allAlbumNames = document.querySelectorAll('.list-group-item')
const spotifyPlayer = document.querySelector('.spotify-embed iframe')
for (let album of allAlbumNames){
    album.addEventListener('click', loadNewAlbumSpotify)
}

function loadNewAlbumSpotify (e) {
    console.log(e)
    console.dir(e.target.offsetParent)
    const albumIdToLoad = e.target.offsetParent.dataset.spotifyAlbumId
    spotifyPlayer.src = `https://open.spotify.com/embed/album/${albumIdToLoad}?utm_source=generator" width="100%" height="400" frameBorder="0" allowfullscreen="0" allow="autoplay"; clipboard-write; encrypted-media; fullscreen; picture-in-picture`
    spotifyPlayer.scrollIntoView({behavior:'smooth', block:'center'})
}