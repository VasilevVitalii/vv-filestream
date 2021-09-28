import * as lib from '../src'
import * as path from 'path'
import * as fs from 'fs'

const full_file_name_bad = 'a:/bad_file.json'
const full_file_name_good1 = path.join(__dirname, '..', '..', 'test', 'good_file1.json')
const full_file_name_good2 = path.join(__dirname, '..', '..', 'test', 'good_file2.json')

const data_good = [
    {aaaa: 1},
    {aaaa: 2},
    {aaaa: 3},
]

const stream = lib.createWriteStream (
    {prefix: '[\n', suffix: '{}\n]'}
)
stream.onClose(results => {
    if (results.length !== 3) {
        console.warn(`TEST ERROR - results.length !== 3`)
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
    const fnd_good1 = results.find(f => f.fullFileName === full_file_name_good1)
    if (!fnd_good1) {
        console.warn(`TEST ERROR - !fnd_good1`)
        process.exit()
    }
    if (fnd_good1.error) {
        console.warn(`TEST ERROR - fnd_good1.error`)
        process.exit()
    }
    const fnd_good2 = results.find(f => f.fullFileName === full_file_name_good2)
    if (!fnd_good2) {
        console.warn(`TEST ERROR - !fnd_good2`)
        process.exit()
    }
    if (fnd_good2.error) {
        console.warn(`TEST ERROR - fnd_good2.error`)
        process.exit()
    }

    let raw_good1 = ''
    try {
        raw_good1 = fs.readFileSync(full_file_name_good1, 'utf8')
    } catch (error) {
        console.warn(`TEST ERROR - in read file ${full_file_name_good1} - ${(error as Error).message} `)
        process.exit()
    }
    let raw_good2 = ''
    try {
        raw_good2 = fs.readFileSync(full_file_name_good2, 'utf8')
    } catch (error) {
        console.warn(`TEST ERROR - in read file ${full_file_name_good2} - ${(error as Error).message} `)
        process.exit()
    }

    let json_good1 = undefined
    try {
        json_good1 = JSON.parse(raw_good1).filter(f => f.aaaa)
    } catch (error) {
        console.warn(`TEST ERROR - in parse file raw_good1 - ${(error as Error).message}`)
        process.exit()
    }
    let json_good2 = undefined
    try {
        json_good2 = JSON.parse(raw_good2).filter(f => f.aaaa)
    } catch (error) {
        console.warn(`TEST ERROR - in parse file raw_good2 - ${(error as Error).message}`)
        process.exit()
    }

    if (JSON.stringify(data_good) !== JSON.stringify(json_good1)) {
        console.warn(`TEST ERROR - JSON.stringify(data_good) !== JSON.stringify(json_good1)`)
        process.exit()
    }
    if (JSON.stringify(data_good) !== JSON.stringify(json_good2)) {
        console.warn(`TEST ERROR - JSON.stringify(data_good) !== JSON.stringify(json_good2)`)
        process.exit()
    }

    console.log('TEST PASSED')
})

stream.write({fullFileName: full_file_name_bad, data: 'text1'})
stream.write({fullFileName: full_file_name_good1, data: JSON.stringify(data_good[0]).concat(',\n')})
stream.write({fullFileName: full_file_name_good2, data: data_good[0]})
stream.write({fullFileName: full_file_name_bad, data: 'text2'})
stream.write({fullFileName: full_file_name_bad, data: 'text3'})

stream.write({fullFileName: full_file_name_good1, data: JSON.stringify(data_good[1]).concat(',\n') })
stream.write({fullFileName: full_file_name_good1, data: JSON.stringify(data_good[2]).concat(',\n') })
stream.write({fullFileName: full_file_name_good2, data: [data_good[1], data_good[2]]})

stream.close()

