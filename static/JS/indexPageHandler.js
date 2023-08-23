const postIntro = document.querySelector("#postIntroContainer");
const navtoggle = document.querySelector('.navbar-toggler')
const dropdownToggle = document.querySelector('a.nav-link.dropdown-toggle')
dropdownToggle.addEventListener('click', () =>{
    if(navtoggle.classList.contains('collapsed')){
    postIntro.style.marginTop = '70px'
  } else if(dropdownToggle.classList.contains('show')) {
    postIntro.style.marginTop = '284px'
  } else {
    postIntro.style.marginTop = '216px'
  }
})
navtoggle.addEventListener('click', (e) =>{
    console.log(e.target)
  const target = e.target
  if(navtoggle.classList.contains('collapsed')){
    postIntro.style.marginTop = '70px'
  } else if(dropdownToggle.classList.contains('show')) {
    postIntro.style.marginTop = '284px'
  } else {
    postIntro.style.marginTop = '216px'
  }
})
const introText = document.querySelectorAll(".intro-text");
const mainContainer = document.querySelector("#main-page-container");
for (let node of introText) {
    node.addEventListener("animationend", () => {
        node.innerHTML = '<p class="band-name-text"> Blank </p>';
        const introContainer = document.querySelector(".band-text-container");
        introContainer.classList.add("fade-out");
        introContainer.addEventListener("animationend", (e) => {
            if (e.target.classList.contains("band-text-container")) {
                introContainer.classList.add("hide");
                postIntro.classList.remove("hide");
            }
        });
    });
}