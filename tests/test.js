const fs = require("fs");
const kaitaiStream = require('./KaitaiStream');

const Generator = require("../main")

// PNG serializer generation
try {
    fs.writeFileSync("./tests/pngser.js", Generator(fs.readFileSync("./tests/png.ksy", "utf8")))
} catch (e) {
    throw new Error("Unable to generate PNG serializer: " + e)
}

const png = require("./png");
const pngser = require("./pngser")

// Test the PNG serializer
const pngFile = fs.readFileSync("./tests/test.png")

if(Buffer.compare(pngFile, pngser(new png(new kaitaiStream(pngFile)))) != 0) {
    throw new Error("PNG serializer test failed")
}

// ZIP serializer generation
try {
    fs.writeFileSync("./tests/zipser.js", Generator(fs.readFileSync("./tests/zip.ksy", "utf8")))
} catch (e) {
    throw new Error("Unable to generate ZIP serializer: " + e)
}

const zip = require("./zip");
const zipser = require("./zipser")

// Test the ZIP serializer
const zipFile = fs.readFileSync("./tests/test.zip")

if(Buffer.compare(zipFile, zipser(new zip(new kaitaiStream(zipFile)))) != 0) {
    throw new Error("ZIP serializer test failed")
}

console.log("Success")