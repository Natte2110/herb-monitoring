// const { beforeEach } = require("node:test");

beforeEach(() => {
    const fs = require('fs');

    let fileContents = fs.readFileSync("index.html", "utf-8");

    document.open();
    document.write(fileContents);
    document.close();
});