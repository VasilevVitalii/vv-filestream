# For NodeJS, custom WriteStream, based on standard fs.WriteStream.
## Differences from the standard fs.WriteStream:
1. Parallel writing of multiple files (with callback after the end of recording of all files)
2. Ability to write JSON through the stream (see example)

## Install
```
npm i vv-filestream
```