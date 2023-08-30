
const filterForm = document.querySelector('#filterAccordion')
const allFilterRadios = document.querySelector('#filterButtonContainer').querySelectorAll('.form-check-input')
const submitFilterButton = document.querySelector('#submitFilterButton')
const clearFilterButton = document.querySelector('#clearFilterButton')

function applyFiltersOnPageLoad(){
    const currentFilters = Array.from(new URLSearchParams(window.location.search).values())
    for(let button of allFilterRadios){
        if(currentFilters.includes(button.dataset.queryId)){
            button.checked = true
        }
    }
}

function resetForm (e){
    e.preventDefault()
    filterForm.reset()
}

function handleFilterApply(){
    let filtersToApply = new URLSearchParams()
    for(let filter of allFilterRadios){
        if(filter.checked === true){
            filtersToApply.append(filter.name, filter.dataset.queryId)
        }
    }
    const newQueryString = filtersToApply.toString()
    window.location.href=`/artists?${newQueryString}`
}    

function handleFilterSubmit(e){
    e.preventDefault()
    handleFilterApply()
    console.log(filterForm.action)
}

applyFiltersOnPageLoad()
submitFilterButton.addEventListener('click', handleFilterSubmit)
clearFilterButton.addEventListener('click', resetForm)
