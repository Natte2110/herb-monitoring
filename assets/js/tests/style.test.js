/**
 * @jest-environment jsdom
 */

const { navColourChange, backgroundBlurChange} = require("../style")

beforeEach(() => {
    const fs = require('fs');

    let fileContents = fs.readFileSync("index.html", "utf-8");

    document.open();
    document.write(fileContents);
    document.close();
});

describe("Dynamic Style Effects", () => {
    describe("Navbar Colour Changing", () => {
        test("Expect Navbar Colour to be transparent", () => {
            expect(document.getElementById("site-nav").style.backgroundColor).toEqual("");
        });
        test("Expect navbar to change to an opaque background", () => {
            navColourChange(300);
            expect(document.getElementById("site-nav").style.backgroundColor).toEqual("rgb(40, 45, 50)");
        });
        test("Expect navbar to change to an opacity of 2/3 the max value", () => {
            navColourChange(200);
            let expectedOpacity = 200 / 300
            expect(document.getElementById("site-nav").style.backgroundColor).toEqual("rgba(40, 45, 50, " + expectedOpacity + ")");
        });
        test("Expect navbar opacity to still be 1 over the max scroll amount", () => {
            navColourChange(400);
            expect(document.getElementById("site-nav").style.backgroundColor).toEqual("rgb(40, 45, 50)");
        });
        test("Expect navbar opacity change dynamically when window is scrolled", () => {
            // event listener for when the window is scrolled
            window.addEventListener('scroll', () => {
                navColourChange(document.documentElement.scrollTop);
            });

            // Send a scroll event to the mock dom
            const scrollEvent = new Event('scroll');
            window.dispatchEvent(scrollEvent);

            // Get the expected opacity of the new background
            let expectedOpacity = document.documentElement.scrollTop / 300
            
            expect(document.getElementById("site-nav").style.backgroundColor).toEqual("rgba(40, 45, 50, " + expectedOpacity + ")");
        });
    });
    describe("Landing Image Blurring", () => {
        test("Expect No blur when page loaded", () => {
            expect(document.getElementsByClassName("landing-image")[0].style.backgroundColor).toEqual("");
        });
        test("Expect blur to be 10px when page scrolled to 600", () => {
            backgroundBlurChange(600);
            expect(document.getElementsByClassName("landing-image")[0].style.filter).toEqual("blur(10px)");
        });
        test("Expect blur value to be 5px at a scroll value of 300", () => {
            backgroundBlurChange(300);
            let expectedBlur = 10 * (300 / 600);
            expect(document.getElementsByClassName("landing-image")[0].style.filter).toEqual("blur(" + expectedBlur + "px)");
        });
        test("Expect blur value to still be 10px over the max scroll value of 600", () => {
            backgroundBlurChange(700);
            expect(document.getElementsByClassName("landing-image")[0].style.filter).toEqual("blur(10px)");
        });
        test("Expect value change dynamically when window is scrolled", () => {
            // event listener for when the window is scrolled
            window.addEventListener('scroll', () => {
                backgroundBlurChange(document.documentElement.scrollTop);
            });

            // Send a scroll event to the mock dom
            const scrollEvent = new Event('scroll');
            window.dispatchEvent(scrollEvent);

            // Get the expected opacity of the new background
            let expectedBlur = 10 * (document.documentElement.scrollTop  / 600);
            expectedBlur >= 10 ? expectedBlur = 10 : expectedBlur = expectedBlur;

            expect(document.getElementsByClassName("landing-image")[0].style.filter).toEqual("blur(" + expectedBlur + "px)");
        });
    });
});