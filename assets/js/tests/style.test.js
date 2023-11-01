/**
 * @jest-environment jsdom
 */

beforeEach(() => {
    const fs = require('fs');

    let fileContents = fs.readFileSync("index.html", "utf-8");

    document.open();
    document.write(fileContents);
    document.close();
});

describe("Dynamic Style Effects", () => {
    describe("Navbar Colour Changing", () => {
        test("Expect Navbar Colour to Change", () => {
            document.documentElement.scrollTop = 0;
            expect(document.getElementById("site-nav").style.backgroundColor).toEqual("");
        })
    })
})