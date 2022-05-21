class BinaryWriter {
    constructor() {
        this.position = 0
        this.buffer = []
        this.tmp = Buffer.allocUnsafe(8)
        
        for(let x = 0; x < 12; x++) {
            this[`write${x >= 8 ? "Big" : ""}${x % 2 == 0 ? 'U' : ''}Int${8 * 2 ** (Math.floor(x / 4) + 1)}${(x >> 1) % 2 == 0 ? "LE" : "BE"}`] = (value) => {
                this.tmp[`write${x >= 8 ? "Big" : ""}${x % 2 == 0 ? 'U' : ''}Int${8 * 2 ** (Math.floor(x / 4) + 1)}${(x >> 1) % 2 == 0 ? "LE" : "BE"}`](value, 0)
                this.buffer.push(Buffer.from(this.tmp.slice(0, 2 ** (Math.floor(x / 4) + 1))))
                this.position += 2 ** (Math.floor(x / 4) + 1)
            }
        }
    }

    writeInt8(value) {
        this.tmp.writeInt8(value, 0)
        this.buffer.push(Buffer.from(this.tmp.slice(0, 1)))
        this.position += 1
    }

    writeUInt8(value) {
        this.tmp.writeUInt8(value, 0)
        this.buffer.push(Buffer.from(this.tmp.slice(0, 1)))
        this.position += 1
    }

    writeFloatLE(value) {
        this.tmp.writeFloatLE(value, 0)
        this.buffer.push(Buffer.from(this.tmp.slice(0, 4)))
        this.position += 4
    }

    writeFloatBE(value) {
        this.tmp.writeFloatBE(value, 0)
        this.buffer.push(Buffer.from(this.tmp.slice(0, 4)))
        this.position += 4
    }

    writeDoubleLE(value) {
        this.tmp.writeDoubleLE(value, 0)
        this.buffer.push(Buffer.from(this.tmp.slice(0, 8)))
        this.position += 8
    }

    writeDoubleBE(value) {
        this.tmp.writeDoubleBE(value, 0)
        this.buffer.push(Buffer.from(this.tmp.slice(0, 8)))
        this.position += 8
    }

    writeStr(str, encoding = 'utf-8') {
        this.buffer.push(Buffer.from(Buffer.from(str).toString(encoding)))
        this.position += str.length
    }

    writeStrNT(str, encoding = 'utf-8') {
        this.writeStr(str, encoding)
        this.writeInt8(0)
    }

    writeUInt8Array(arr) {
        this.buffer.push(Buffer.from(arr))
        this.position += arr.length
    }

// [CUSTOMTYPES]

    finalize() {
        return Buffer.concat(this.buffer)
    }
}

module.exports = (data) => {
    const writer = new BinaryWriter()
    
// [SEQUENCE]

    return writer.finalize()
}