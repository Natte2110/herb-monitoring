/**
 * @jest-environment jsdom
 */

const {navColourChange} = require("../style")

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
        })
    });
});