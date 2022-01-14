import * as lib from '../src'
import * as path from 'path'
import * as fs from 'fs'
//import * as ml from './findMemoryLeak'
//ml.Go()

const fullFileNameAppend = path.join(__dirname, '..', '..', 'test', 'append.txt')
const fullFileNameBad = 'a:/bad_file.json'
const fullFileNameGood1 = path.join(__dirname, '..', '..', 'test', 'good_file1.json')
const fullFileNameGood2 = path.join(__dirname, '..', '..', 'test', 'good_file2.json')

const dataGood = [
    {aaaa: 1},
    {aaaa: 2},
    {aaaa: 3},
]

fs.writeFileSync(fullFileNameAppend, 'existsline1\n', 'utf8')

const stream = lib.Create (
    {prefix: '[\n', suffix: '{}\n]'}
)

stream.write({fullFileName: fullFileNameAppend, data: 'line: 1\n', mode: 'append'})

stream.write({fullFileName: fullFileNameBad, data: 'text1'})
stream.write({fullFileName: fullFileNameGood1, data: JSON.stringify(dataGood[0]).concat(',\n')})
stream.write({fullFileName: fullFileNameGood2, data: dataGood[0]})
stream.write({fullFileName: fullFileNameBad, data: 'text2'})
stream.write({fullFileName: fullFileNameBad, data: 'text3'})

stream.write({fullFileName: fullFileNameGood1, data: JSON.stringify(dataGood[1]).concat(',\n') })
stream.write({fullFileName: fullFileNameGood1, data: JSON.stringify(dataGood[2]).concat(',\n') })
stream.write({fullFileName: fullFileNameGood2, data: [dataGood[1], dataGood[2]]})

stream.write({fullFileName: fullFileNameAppend, data: 'line: 2\n', mode: 'append'})

stream.close(results => {
    if (results.length !== 4) {
        console.warn(`TEST ERROR - results.length !== 4`)
        process.exit()
    }
    const isFindBad = results.find(f => f.fullFileName === fullFileNameBad)
    if (!isFindBad) {
        console.warn(`TEST ERROR - !fnd_bad`)
        process.exit()
    }
    if (!isFindBad.error) {
        console.warn(`TEST ERROR - !fnd_bad.error`)
        process.exit()
    }
    const isFindGood1 = results.find(f => f.fullFileName === fullFileNameGood1)
    if (!isFindGood1) {
        console.warn(`TEST ERROR - !fnd_good1`)
        process.exit()
    }
    if (isFindGood1.error) {
        console.warn(`TEST ERROR - fnd_good1.error`)
        process.exit()
    }
    const isFindGood2 = results.find(f => f.fullFileName === fullFileNameGood2)
    if (!isFindGood2) {
        console.warn(`TEST ERROR - !fnd_good2`)
        process.exit()
    }
    if (isFindGood2.error) {
        console.warn(`TEST ERROR - fnd_good2.error`)
        process.exit()
    }

    let rawGood1 = ''
    try {
        rawGood1 = fs.readFileSync(fullFileNameGood1, 'utf8')
    } catch (error) {
        console.warn(`TEST ERROR - in read file ${fullFileNameGood1} - ${(error as Error).message} `)
        process.exit()
    }
    let rawGood2 = ''
    try {
        rawGood2 = fs.readFileSync(fullFileNameGood2, 'utf8')
    } catch (error) {
        console.warn(`TEST ERROR - in read file ${fullFileNameGood2} - ${(error as Error).message} `)
        process.exit()
    }
    let rawAppend = ''
    try {
        rawAppend = fs.readFileSync(fullFileNameAppend, 'utf8')
    } catch (error) {
        console.warn(`TEST ERROR - in read file ${fullFileNameAppend} - ${(error as Error).message} `)
        process.exit()
    }

    let jsonGood1 = undefined
    try {
        jsonGood1 = JSON.parse(rawGood1).filter(f => f.aaaa)
    } catch (error) {
        console.warn(`TEST ERROR - in parse file raw_good1 - ${(error as Error).message}`)
        process.exit()
    }
    let jsonGood2 = undefined
    try {
        jsonGood2 = JSON.parse(rawGood2).filter(f => f.aaaa)
    } catch (error) {
        console.warn(`TEST ERROR - in parse file raw_good2 - ${(error as Error).message}`)
        process.exit()
    }

    let textAppend = undefined
    try {
        textAppend = rawAppend.split('\n').map(m => { return m.trim() }).filter(f => f).join('')
    } catch (error) {
        console.warn(`TEST ERROR - in parse file rawAppend - ${(error as Error).message}`)
        process.exit()
    }

    if (JSON.stringify(dataGood) !== JSON.stringify(jsonGood1)) {
        console.warn(`TEST ERROR - JSON.stringify(data_good) !== JSON.stringify(json_good1)`)
        process.exit()
    }
    if (JSON.stringify(dataGood) !== JSON.stringify(jsonGood2)) {
        console.warn(`TEST ERROR - JSON.stringify(data_good) !== JSON.stringify(json_good2)`)
        process.exit()
    }
    if (textAppend !== 'existsline1line: 1line: 2') {
        console.warn(`TEST ERROR - bad textAppend`)
        process.exit()
    }

    console.log('TEST PASSED')
})