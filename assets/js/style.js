/**
 * @jest-environment jsdom
 */

const navColourChange = (scrollValue) => {
    document.getElementById("site-nav").style.backgroundColor = "rgba(40, 45, 50, 1)"
}

module.exports = {navColourChange};