async function checkValidToken (){
    const proveLifeMsg = document.querySelector('#proveLifeMsg')
    !proveLifeMsg.classList.contains('d-none') ? proveLifeMsg.classList.add('d-none'): null
    const userToken = grecaptcha.getResponse()
    const verifyRequest = await fetch('/anti-robot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({userToken: userToken})
    })
    if(verifyRequest.status === 200){
        const submitButton = document.querySelector('#contactFormSubmit')
        submitButton.removeAttribute('disabled')
    } else {
        proveLifeMsg.classList.remove('d-none')
    }
}

async function updateExpiredToken () {
    const submitButton = document.querySelector('#contactFormSubmit')
    submitButton.setAttribute('disabled', true)
    const proveLifeMsg = document.querySelector('#proveLifeMsg')
    proveLifeMsg.classList.contains('d-none') ? proveLifeMsg.classList.remove('d-none'): null
}