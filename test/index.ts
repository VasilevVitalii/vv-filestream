import * as lib from '../src'
import * as path from 'path'
import * as fs from 'fs'

const full_file_name_bad = 'a:/bad_file.json'
const full_file_name_good = path.join(__dirname, '..', '..', 'test', 'good_file.json')

const data_good = [
    {aaaa: 1},
    {aaaa: 2},
    {aaaa: 3},
]

const stream = lib.createWriteStream (
    {prefix: '[\n', suffix: ']'}
)
stream.onClose(results => {
    if (results.length !== 2) {
        console.warn(`TEST ERROR - results.length !== 2`)
        process.exit()
    }
    const fnd_bad = results.find(f => f.fullFileName === full_file_name_bad)
    if (!fnd_bad) {
        console.warn(`TEST ERROR - !fnd_bad`)
        process.exit()
    }
    if (!fnd_bad.error) {
        console.warn(`TEST ERROR - !fnd_bad.error`)
        process.exit()
    }
    const fnd_good = results.find(f => f.fullFileName === full_file_name_good)
    if (!fnd_good) {
        console.warn(`TEST ERROR - !fnd_good`)
        process.exit()
    }
    if (fnd_good.error) {
        console.warn(`TEST ERROR - fnd_good.error`)
        process.exit()
    }

    let raw_good = ''
    try {
        raw_good = fs.readFileSync(full_file_name_good, 'utf8')
    } catch (error) {
        console.warn(`TEST ERROR - in read file ${full_file_name_good} - ${(error as Error).message} `)
        process.exit()
    }

    let json_good = undefined
    try {
        json_good = JSON.parse(raw_good)
    } catch (error) {
        console.warn(`TEST ERROR - in parse file raw_good - ${(error as Error).message}`)
        process.exit()
    }

    if (JSON.stringify(data_good) !== JSON.stringify(json_good)) {
        console.warn(`TEST ERROR - JSON.stringify(data_good) !== JSON.stringify(json_good)`)
        process.exit()
    }

    console.log('TEST PASSED')
})

stream.write({fullFileName: full_file_name_bad, data: 'text1'})
stream.write({fullFileName: full_file_name_good, data: JSON.stringify(data_good[0]).concat(',\n')})
stream.write({fullFileName: full_file_name_bad, data: 'text2'})
stream.write({fullFileName: full_file_name_bad, data: 'text3'})
stream.write({fullFileName: full_file_name_good, data: JSON.stringify(data_good[1]).concat(',\n') })
stream.write({fullFileName: full_file_name_good, data: JSON.stringify(data_good[2]).concat('\n') })
stream.close()

