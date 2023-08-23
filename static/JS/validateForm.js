const form = document.querySelector('.needs-validation')
form.addEventListener('submit', validateForm)
async function validateForm(e){
    e.preventDefault()
    const gToken = grecaptcha.getResponse()
    if (!form.checkValidity() || form.subject.value === 'Please Select One' || gToken === ''){
        form.classList.add('was-validated')
        if(grecaptcha.getResponse() ===''){
            const showTarget = document.querySelector('#proveLifeMsg')
            showTarget.classList.remove('d-none')
        }
    } else {
        submitForm(form)
    }
}
