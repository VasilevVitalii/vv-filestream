import * as lib from '../src'
import * as path from 'path'
import * as fs from 'fs'



export function Go() {
    console.log('GO!')
    const fullFileNameAppend = path.join(__dirname, '..', '..', 'test', 'append.txt')
    let timer = setTimeout(function tick() {
        console.log('START')
        fs.writeFileSync(fullFileNameAppend, '\n', 'utf8')
        const stream = lib.Create (
            {prefix: '[\n', suffix: '{}\n]'}
        )
        stream.onClose(() => {
            console.log('FINISH')
            timer = setTimeout(tick, 1000 * 10)
        })
        for (let i = 0; i < 1000; i++) {
            stream.write({data: `line ${i}\n`, fullFileName: fullFileNameAppend, mode: 'append'})
        }
        stream.close()
    }, 1000 * 10)
}