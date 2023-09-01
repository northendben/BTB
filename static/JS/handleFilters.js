
const filterForm = document.querySelector('#filterAccordion')
const allFilterRadios = document.querySelector('#filterButtonContainer').querySelectorAll('.form-check-input')
const submitFilterButton = document.querySelector('#submitFilterButton')
const clearFilterButton = document.querySelector('#clearFilterButton')
const allSwitches = document.querySelectorAll('.form-check-input[role="switch"]')
for(let s of allSwitches){
    s.addEventListener('click', handleToggles)
}

function handleToggles(e){
    const clickedSwitch = e.srcElement
    if(clickedSwitch.checked === true){
        const siblingSwitches = clickedSwitch.parentElement.parentElement.children
        for(let filterSwitch of siblingSwitches){
            filterSwitch.children[1].id != clickedSwitch.id ? filterSwitch.children[1].checked = false: null
        }
    }
}


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
    handleFilterApply()
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
