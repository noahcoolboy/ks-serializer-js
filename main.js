const yaml = require("js-yaml")
const fs = require("fs")
const binarywriter = fs.readFileSync("./binarywriter.js", "utf8")

function transformName(n, firstUpper = false) {
    return n.replace(/_[a-z0-9]/g, (s) => s.substring(1).toUpperCase()).replace(/_/g, "").replace(/^[a-z]/, (s) => firstUpper ? s.toUpperCase() : s)
}

function generate(data) {
    data = yaml.load(data)

    let endian = "LE"
    let encoding = "UTF-8"
    if (data.meta) {
        endian = (data.meta.endian || endian).toUpperCase()
        encoding = (data.meta.encoding || encoding).toLowerCase()
    }

    const typeMap = {
        "u1": "writeUInt8",
        "u2": "writeUInt16",
        "u2le": "writeUInt16LE",
        "u2be": "writeUInt16BE",
        "u4": "writeUInt32",
        "u4le": "writeUInt32LE",
        "u4be": "writeUInt32BE",
        "u8": "writeUInt64",
        "u8le": "writeUInt64LE",
        "u8be": "writeUInt64BE",
        "s1": "writeInt8",
        "s2": "writeInt16",
        "s2le": "writeInt16LE",
        "s2be": "writeInt16BE",
        "s4": "writeInt32",
        "s4le": "writeInt32LE",
        "s4be": "writeInt32BE",
        "s8": "writeInt64",
        "s8le": "writeInt64LE",
        "s8be": "writeInt64BE",
        "f4": "writeFloatLE",
        "f4le": "writeFloatLE",
        "f4be": "writeFloatBE",
        "f8": "writeDoubleLE",
        "f8le": "writeDoubleLE",
        "f8be": "writeDoubleBE",
        "str": "writeStr",
        "strz": "writeStrNT",
    }

    let types = []
    if (data.types) {
        Object.keys(data.types).forEach((k) => {
            let type = []
            type.push(`write${transformName(k, true)}(data) {`)
            for (let item of data.types[k].seq) {
                if (item.repeat)
                    type.push(`for(let entry of data.${transformName(item.id)}) {`)

                if (typeof item.type == "object") {
                    type.push(`\tswitch(data.${transformName(item.type["switch-on"])}) {`)
                    for (let item2 in item.type.cases) {
                        let key;
                        if (item2.match(/^[a-zA-Z0-9_-]+::[a-zA-Z0-9_-]+$/)) {
                            key = Object.keys(data.enums[item2.split("::")[0]]).find((k, i, o) => data.enums[item2.split("::")[0]][k] == item2.split("::")[1])
                        }

                        if (item2 != "_") {
                            type.push("\t\tcase " + (key || item2) + ":")
                            type.push(`\t\t\tthis.${typeMap[item.type.cases[item2]] || "write" + transformName(item.type.cases[item2], true)}(${item.repeat ? "entry" : `data.${transformName(item.id)}`})`)
                            type.push("\t\t\tbreak")
                        }
                    }

                    type.push("\t\tdefault:")
                    type.push(`\t\t\tthis.${typeMap[item.type.cases["_"] || "u_int8_array"] || "write" + transformName(item.type.cases["_"] || "u_int8_array", true)}(${item.repeat ? "entry" : `data.${transformName(item.id)}`})`)
                    type.push(`\t}`)
                } else {
                    item.type = item.type || "u_int8_array"
                    if (item.type && !item.type.startsWith("str") && item.type != "u1" && typeMap[item.type] && (!item.type.endsWith("LE") && !item.type.endsWith("BE")))
                        item.type += endian
                    item.type = item.type.toLowerCase()
                    type.push(`\tthis.${typeMap[item.type] || "write" + transformName(item.type, true)}(${item.repeat ? "entry" : `data.${transformName(item.id)}`})`)
                }

                if (item.repeat)
                    type.push(`}`)
            }
            type.push("}")
            type = type.map(v => "\t" + v)
            types.push(type.join("\n"))
        })
    }

    let seq = []
    for (let item of data.seq) {
        if (item.repeat)
            seq.push(`for(let entry of data.${transformName(item.id)}) {`)

        if (typeof item.type == "object") {
            seq.push(`\tswitch(data.${transformName(item.type["switch-on"])}) {`)
            for (let item2 in item.type.cases) {
                let key;
                if (item2.match(/^[a-zA-Z0-9_-]+::[a-zA-Z0-9_-]+$/)) {
                    key = Object.keys(data.enums[item2.split("::")[0]]).find((k, i, o) => data.enums[item2.split("::")[0]][k] == item2.split("::")[1])
                }

                if (item2 != "_") {
                    seq.push("\t\tcase " + (key || item2) + ":")
                    seq.push(`\t\t\twriter.${typeMap[item.type.cases[item2]] || "write" + transformName(item.type.cases[item2], true)}(${item.repeat ? "entry" : `data.${transformName(item.id)}`})`)
                    seq.push("\t\t\tbreak")
                }
            }

            seq.push("\t\tdefault:")
            seq.push(`\t\t\twriter.${typeMap[item.type.cases["_"] || "u_int8_array"] || "write" + transformName(item.type.cases["_"] || "u_int8_array", true)}(${item.repeat ? "entry" : `data.${transformName(item.id)}`})`)
            seq.push(`\t}`)
        } else {
            item.type = item.type || "u_int8_array"
            if (item.type && !item.type.startsWith("str") && item.type != "u1" && typeMap[item.type] && (!item.type.endsWith("LE") && !item.type.endsWith("BE")))
                item.type += endian
            item.type = item.type.toLowerCase()
            seq.push(`\twriter.${typeMap[item.type] || "write" + transformName(item.type, true)}(${item.repeat ? "entry" : `data.${transformName(item.id)}`})`)
        }

        if (item.repeat)
            seq.push(`}`)
    }

    return binarywriter.replace("/* endian */", endian).replace("// [CUSTOMTYPES]", types.join("\n\n")).replace("// [SEQUENCE]", seq.join("\n"))
}

module.exports = generate

if (require.main == module) {
    let fs = require("fs")
    let args = process.argv.slice(2)
    let file = args[0]
    let output = args[1]
    if (!file) {
        console.error("No input file specified")
        process.exit(1)
    }
    if (!output) {
        console.error("No output file specified")
        process.exit(1)
    }
    let data = fs.readFileSync(file, "utf8")
    fs.writeFileSync(output, generate(data))
}