/*const fs = require("fs");
const Test = require("./Test");
const KaitaiStream = require('kaitai-struct/KaitaiStream');

const fileContent = fs.readFileSync("test.bin");
const parsed = new Test(new KaitaiStream(fileContent));
console.log(parsed)*/

const fs = require("fs");
const Zip = require("./tests/Zip");
const KaitaiStream = require('kaitai-struct/KaitaiStream');

const fileContent = fs.readFileSync("Test File.zip");
const parsed = new Zip(new KaitaiStream(fileContent));
console.log(parsed)

const reserialize = require("./out")
fs.writeFileSync("output.zip", reserialize(parsed))

setTimeout(() => {
    
}, 50000);