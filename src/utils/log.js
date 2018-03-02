import { writeFileSync } from 'fs'
import path from 'path'
const isPlaintObj = obj => typeof obj === 'object' && obj !== null

const noConvertJSON = json => {
    const registed = []
    const getResult = json => {
        if (typeof json === 'object' && json !== null) {
            if (Array.isArray(json)) {
                return json.map(getResult)
            }
            if (registed.includes(json)) {
                return json.range || json.type || 'REPEATED'
            }
            registed.push(json)
            const result = {}
            for (let key in json) {
                result[key] = getResult(json[key])
            }
            return result
        }
        return json
    }
    return getResult(json)
}

export default () => {
    let id = 0
    return str => {
        id++
        if (isPlaintObj(str)) {
            writeFileSync(path.resolve(__dirname, '../../log', `${id}.json`), JSON.stringify(noConvertJSON(str), null, 4))
        } else {
            writeFileSync(path.resolve(__dirname, '../../log', `${id}.json`), str)
        }
    }
}