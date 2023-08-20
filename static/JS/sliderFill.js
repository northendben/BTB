const sliders = document.querySelectorAll(".range");
const adjustSlider = () => {
    for(let slider of sliders){
        slider.addEventListener("input", adjustSlider);
  const min = slider.min;
  const max = slider.max;
  // Calculate visible width
  const val = ((slider.value - min) * 100) / (max - min);
  
  // Change these variables to the colors you need
  const fillLeft = "#389540";
  const fillRight = "rgba(255,255,255,.15)";
  
  slider.style.background = `linear-gradient(to right, ${fillLeft} ${val}%, ${fillRight} ${val}%`;
}}
adjustSlider();