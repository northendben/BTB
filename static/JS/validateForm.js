const form = document.querySelector('.needs-validation')
form.addEventListener('submit', validateForm)
function validateForm(e){
    e.preventDefault()
    if (!form.checkValidity() || form.subject.value === 'Please Select One'){
        // if(form.subject.value === 'Please Select One'){
        //     const selectErrorMessage = document.querySelector('#subject')
        //     selectErrorMessage.classList.add('is-invalid')
        //     selectErrorMessage.nextElementSibling.style.display = 'block'
        // }
        form.classList.add('was-validated')
    } else {
    submitForm(form)
    }
}
