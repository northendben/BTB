const form = document.querySelector('.needs-validation')
form.addEventListener('submit', validateForm)
function validateForm(e){
    e.preventDefault()
    if (!form.checkValidity() || form.subject.value === 'Please Select One' || grecaptcha.getResponse() === ''){
        form.classList.add('was-validated')
        if(grecaptcha.getResponse() ===''){
            const showTarget = document.querySelector('#proveLifeMsg')
            showTarget.classList.remove('d-none')
        }
    } else {
    submitForm(form)
    }
}
