$(window).on('load', function () {
    $('.preloader').delay(2400).fadeOut('slow');
});


// Navigation Menu
const btn = document.querySelector("button.mobile-menu-button");
const menu = document.querySelector(".mobile-menu");

btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
});
