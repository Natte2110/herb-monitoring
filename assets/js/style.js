/**
 * @jest-environment jsdom
 */

window.addEventListener('scroll', () => {
    navColourChange(document.documentElement.scrollTop);
    backgroundBlurChange(document.documentElement.scrollTop);
});

const navColourChange = (scrollValue) => {
    let opacity = scrollValue / 300;
    document.getElementById("site-nav").style.backgroundColor = "rgba(40, 45, 50, " + opacity + ")"
}

const backgroundBlurChange = (scrollValue) => {
    let blur = 10 * (scrollValue / 600);
    blur >= 10 ? blur = 10 : blur = blur;
    document.getElementById("site-nav").style.filter = "blur(" + blur + "px)";
}

// module.exports = {navColourChange, backgroundBlurChange};