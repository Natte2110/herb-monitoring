/**
 * @jest-environment jsdom
 */

const { navColourChange } = require("../style")

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
});