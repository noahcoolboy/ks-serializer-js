# ks-serializer-js
A tool to generate a JavaScript serializer from kaitai struct files.
## Usage
This tool can be accessed either using require or via the CLI.  
#### Via the CLI
By running `node main.js [input] [output]` with input being the ksy file and output being the name of the output js file, you can generate a serializer.
#### Via JS
You can use the generate function by calling it with the contents of the ksy file. ks-serializer-js will then parse the yaml using js-yaml.  
```nodejs
const Generator = require("../main")
fs.writeFileSync("./pngser.js", Generator(fs.readFileSync("./png.ksy", "utf8")))
```
#### Usage of the serializer in code
Once you've got your serializer, you can require it, and call it with the deserialized object that the official deserializer gave you. You will get a buffer back.
```nodejs
const png = require("./png"); // The file generated with kaitai-struct-compiler
const pngser = require("./pngser") // The file generated with ks-serializer-js
const pngFile = fs.readFileSync("./tests/test.png")

if(Buffer.compare(pngFile, pngser(new png(new kaitaiStream(pngFile)))) == 0) {
    console.log("The files are the same!")
}
```
## Currently supports
- [x] All of the basic types
- [x] Custom types
- [x] Type switching
- [x] Enums
- [x] Repetitions
- [x] Endians and string encodings
- [ ] Conditionals
- [ ] Value expressions
- [ ] Bitfields
- [ ] Imported types
