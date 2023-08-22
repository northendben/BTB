async function submitForm(form){
    const data = {
        'subject': form.subject.value,
        'userEmail': form.userEmail.value,
        'body': form.body.value
    }
    form.reset()
    const req = await fetch('/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    if(req.status === 200){
        return displayMessage(true)
    }
   displayMessage(false)
}

function displayMessage(wasSuccessful) {
    const containerToHide = document.querySelector('#contactWrapper')
    containerToHide.classList.add('d-none')
    const msgContainer = document.querySelector('.e-mail-confirmation-message')
    const successMsg = document.querySelector('#successMsg')
    const failMsg = document.querySelector('#failMsg')
    msgContainer.classList.remove('d-none')
    msgContainer.classList.add('d-flex')
    if(wasSuccessful === true){
       return  successMsg.classList.remove('d-none')
    }
    return failMsg.classList.remove('d-none')
}

