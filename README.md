# For NodeJS, custom WriteStream, based on standard fs.WriteStream.
## Features
1. Parallel writing multiple files (with once callback after the end of recording all files)
2. Ability to write JSON through the stream (see example)
## License
**MIT**
## Install
```
npm i vv-filestream
```
## Example
Writing two files. Each file is written in two chunks. First file has bad name, second file has good name.
### code
```javascript
const path = require('path')
const fs = require('fs')
const fileNameBad = 'a:/bad.json'
const fileNameGood = path.join(__dirname, 'good.json')
const data1 = [{aaaa: 1},{aaaa: 2},{aaaa: 3}]
const data2 = [{aaaa: 1, bbbb: 1},{aaaa: 2, bbbb: 2},{aaaa: 3, bbbb: 3},{aaaa: 4, bbbb: 4},{aaaa: 5, bbbb: 5}]
const vvfs = require('vv-filestream').Create({prefix: '[\n', suffix: '{}\n]'})
vvfs.onClose(result => {
    result.forEach(f => {
        console.log(`file   ${f.fullFileName}`)
        if (f.error) {
            console.log(`ERROR   ${f.error.message}`)
        } else {
            console.log('DATA')
            console.log(JSON.parse(fs.readFileSync(f.fullFileName, 'utf8')))
        }
    })
})
vvfs.write({fullFileName: fileNameBad, data: data1.slice(0, 2)})
vvfs.write({fullFileName: fileNameGood, data: data2.slice(0, 2)})
vvfs.write({fullFileName: fileNameBad, data: data1.slice(2, 5)})
vvfs.write({fullFileName: fileNameGood, data: data2.slice(2, 5)})
vvfs.close()
```
### note for result
1. result in vvfs.onClose - array:
```
[
    {fullFileName: 'a:/bad.json', error: Error: ENOENT: no such file or directory, open 'a:\\bad.json'}
    {fullFileName: ' ...  good.json', error: undefined}
]
```
2. file **good.json** has content (last empty object used to escape the comma after the previous line):
```
[
{"aaaa":1,"bbbb":2},
{"aaaa":2,"bbbb":2},
{"aaaa":3,"bbbb":3},
{"aaaa":4,"bbbb":4},
{"aaaa":5,"bbbb":5},
{}
]
```