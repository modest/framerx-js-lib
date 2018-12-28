// used to generate id's and links to ids, they are stable per key, but only on runtime

const keys = new Map<string, InternalID>()

export class InternalID {
    private _link: string | null = null
    private _urllink: string | null = null

    constructor(public id: string) {}

    add(str: string): InternalID {
        return InternalID.forKey(this.id + str)
    }

    toString() {
        return this.id
    }

    get link() {
        const res = this._link
        if (res) return res
        return (this._link = "#" + this.id)
    }
    get urlLink() {
        const res = this._urllink
        if (res) return res
        return (this._urllink = "url(#" + this.id + ")")
    }
    static forKey(key: string): InternalID {
        let res = keys.get(key)
        if (res) return res
        res = new InternalID("a" + (1000 + keys.size) + "z")
        keys.set(key, res)
        return res
    }
}
