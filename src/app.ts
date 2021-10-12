import * as path from 'path'
import * as fs from 'fs-extra'
import { TWriteStreamOptions } from '.'

type TStream = {
    fullFileName: string,
    stream: fs.WriteStream,
    buzy: boolean
    error: Error
    queue: (string | any)[]
}

type TWrite = {
    fullFileName: string,
    data: string | any
}

type TResult = {
    fullFileName: string,
    error: Error
}

export class WriteStream {
    private _options: TWriteStreamOptions
    private _streams: TStream[]
    private _closed: boolean
    private _callbackOnClose: (results: TResult[]) => void
    private _ensureDirs: string[]

    constructor(options: TWriteStreamOptions) {
        this._options = options
        this._closed = false
        this._streams = []
        this._ensureDirs = []
        this._timer()
    }

    write(data: TWrite, callback?: () => void): void {
        if (this._closed) return
        let stream = this._streams.find(f => f.fullFileName === data.fullFileName)
        if (stream) {
            stream.queue.push(data.data)
            if (callback) {
                callback()
            }
        } else {
            stream = {
                fullFileName: data.fullFileName,
                stream: undefined,
                buzy: false,
                error: undefined,
                queue: this._options.prefix ? [this._options.prefix, data.data] : [data.data]
            }
            this._streams.push(stream)
            this._ensureDir(data.fullFileName, () => {
                try {
                    const writeStream = fs.createWriteStream(data.fullFileName, 'utf8')
                    writeStream.on('error', error => {
                        if (!stream.error && error !== undefined && error !== null) stream.error = error
                        stream.buzy = false
                    })
                    stream.stream = writeStream
                    if (callback) {
                        callback()
                    }
                } catch (error) {
                    stream.error = error as Error
                }
            })
        }
    }

    close() {
        if (this._options.suffix) {
            this._streams.forEach(stream => { stream.queue.push(this._options.suffix) })
        }
        this._closed = true
    }

    onClose(callback: (results: TResult[]) => void) {
        this._callbackOnClose = callback
    }

    private _timer() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        let timer = setTimeout(function tick() {
            if (self._closed && !self._streams.some(f => f.buzy || (f.queue.length > 0 && !f.error))) {
                self._destroyStreams()
                if (self._callbackOnClose) {
                    self._callbackOnClose(self._streams.map(m => { return {fullFileName: m.fullFileName, error: m.error} }))
                }
                return
            }

            let hasDataForWrite = false
            self._streams.filter(f => f.stream).forEach(stream => {
                if (stream.error || stream.buzy || stream.queue.length <= 0) return
                stream.buzy = true
                stream.stream.write(self._getDataString(stream.queue.shift(), true), 'utf8', error => {
                    if (error !== undefined && error !== null && !stream.error) stream.error = error
                    stream.buzy = false
                })
                hasDataForWrite = true
            })

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            timer = setTimeout(tick, hasDataForWrite ? 10 : 100)
        })
    }

    private _getDataString(data: (string | any), isRoot: boolean): string {
        if (Array.isArray(data) && isRoot) {
            return data.map(m => { return this._getDataString(m, false) }).join('')
        }
        const t = typeof data
        if (t === 'string') {
            return data
        } else if (t === 'object') {
            return JSON.stringify(data).concat(',\n')
        } else {
            try {
                return (data as string).toString()
            } catch (error) {
                return ''
            }
        }
    }

    private _ensureDir(fullFileName: string, callback: () => void) {
        const dir = path.parse(fullFileName).dir
        if (this._ensureDirs.some(f => f === dir)) {
            callback()
            return
        }
        fs.ensureDir(dir, () => {
            this._ensureDirs.push(dir)
            callback()
        })
    }

    private _destroyStreams(): void {
        this._streams.forEach(stream => {
            try {
                stream.queue = undefined
            // eslint-disable-next-line no-empty
            } catch (error) {}
            try {
                stream.stream.close()
            // eslint-disable-next-line no-empty
            } catch (error) {}
            try {
                stream.stream.destroy()
            // eslint-disable-next-line no-empty
            } catch (error) {}
            try {
                stream.stream = undefined
            // eslint-disable-next-line no-empty
            } catch (error) {}
        })
    }
}