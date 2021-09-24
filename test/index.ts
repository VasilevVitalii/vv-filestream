import * as lib from '../src'
import * as path from 'path'
import { setInterval } from 'timers'

// const full_file_name_bad = path.join('a:/111.txt')
// const full_file_name_good = path.join(__dirname, '..', '..', 'test', 'test.json')

const tests = [
    {
        title: 'Create file with bad name',
        options: {fullFileName: 'a:/test1.json'} as lib.TypeWriteStreamOptions,
        write_data: [] as string[],
        result: {
            error: undefined,
            result: undefined as lib.TypeCallbackResult,
        },
        check: {
            need_error: true,
            need_result: false,
            need_file: false
        },
        closed: false,
        printed: false
        //check: {file_exists: false}},
    // {key: '2', options: {fullFileName: path.join(__dirname, '..', '..', 'test', 'test2.json')} as lib.TypeWriteStreamOptions, result: undefined as lib.TypeCallbackResult, check: {file_exists: false}},
    // {key: '3', options: {fullFileName: path.join(__dirname, '..', '..', 'test', 'test3.json')} as lib.TypeWriteStreamOptions, check: {file_exists: true}},
    }
]

tests.forEach(t => {
    const stream = new lib.WriteStream(t.options)
    stream.onClose((error, result) => {
        t.result.error = error
        t.result.result = result
        t.closed = true
    })
    t.write_data.forEach(data => {
        stream.write(data)
    })
    stream.close()
})

setInterval(() => {
    if (tests.every(f => f.printed)) {
        process.exit()
    }
    tests.filter(f => f.closed && !f.printed).forEach(t => {
        t.printed = true
        if (t.check.need_error && !t.result.error) {
            console.warn(`"${t.title}": error - t.check.need_error && !t.result.error`)
            return
        }
        if (!t.check.need_error && t.result.error) {
            console.warn(`"${t.title}": error - !t.check.need_error && t.result.error`)
            return
        }


        console.log(`"${t.title}": passed`)
    })
}, 1000)

// const stream_bad = new lib.WriteStream({fullFileName: full_file_name_bad})
// stream_bad.onClose((error, result) => {
//     console.log(error)
//     console.log(result)
// })
// stream_bad.close()

// const stream_good = new lib.WriteStream({fullFileName: full_file_name_good})
// stream_good.onClose((error, result) => {
//     console.log(error)
//     console.log(result)
// })
// stream_good.close()


// bad_file.onClose((error, result) => {
//     console.log(error)
//     console.log(result)
// })
// bad_file.create()


