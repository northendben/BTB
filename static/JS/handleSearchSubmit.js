const searchSubmitIcon = document.querySelector('#searchNav .search-icon')
const searchForm = document.querySelector('#searchNav')
const currentQuery = window.location.search

async function submitSearchToAPI(e) {
    if(e.type === 'keydown' && e.key ==="Enter"){
        searchForm.submit()
    }
    if(e.type === 'click' && e.srcElement.id === 'submitSearch'){
        searchForm.submit()
    }
}

searchSubmitIcon.addEventListener('click', submitSearchToAPI)
searchForm.addEventListener('keydown', submitSearchToAPI)