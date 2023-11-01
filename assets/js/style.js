/**
 * @jest-environment jsdom
 */

window.addEventListener('scroll', () => {
    navColourChange(document.documentElement.scrollTop);
});

const navColourChange = (scrollValue) => {
    let opacity = scrollValue / 300;
    document.getElementById("site-nav").style.backgroundColor = "rgba(40, 45, 50, " + opacity + ")"
}

// module.exports = {navColourChange};