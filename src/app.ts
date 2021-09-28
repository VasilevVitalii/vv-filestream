import * as fs from 'fs'
import { TypeWriteStreamOptions, TypeWrite, TypeResult } from '.'

type TypeStream = {
    fullFileName: string,
    stream: fs.WriteStream,
    buzy: boolean
    error: Error
    queue: (string | any)[]
}

export class WriteStream {
    private options: TypeWriteStreamOptions
    private streams: TypeStream[]
    private closed: boolean
    private callbacl_onClose: (results: TypeResult[]) => void

    constructor(options: TypeWriteStreamOptions) {
        this.options = options
        this.closed = false
        this.streams = []
        this.timer()
    }

    write(data: TypeWrite): void {
        if (this.closed) return
        let stream = this.streams.find(f => f.fullFileName === data.fullFileName)
        if (stream) {
            stream.queue.push(data.data)
        } else {
            stream = {
                fullFileName: data.fullFileName,
                stream: undefined,
                buzy: false,
                error: undefined,
                queue: this.options.prefix ? [this.options.prefix, data.data] : [data.data]
            }
            try {
                const writeStream = fs.createWriteStream(data.fullFileName, 'utf8')
                writeStream.on('error', error => {
                    if (!stream.error && error !== undefined && error !== null) stream.error = error
                    stream.buzy = false
                })
                stream.stream = writeStream
            } catch (error) {
                stream.error = error as Error
            }
            this.streams.push(stream)
        }
    }

    close() {
        if (this.options.suffix) {
            this.streams.forEach(stream => { stream.queue.push(this.options.suffix) })
        }
        this.closed = true
    }

    onClose(callback: (results: TypeResult[]) => void) {
        this.callbacl_onClose = callback
    }

    private timer() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        let timer = setTimeout(function tick() {
            if (self.closed && !self.streams.some(f => f.buzy || (f.queue.length > 0 && !f.error))) {
                self.destroyStreams()
                if (self.callbacl_onClose) {
                    self.callbacl_onClose(self.streams.map(m => { return {fullFileName: m.fullFileName, error: m.error} }))
                }
                return
            }

            let find_for_write = false
            self.streams.forEach(stream => {
                if (stream.error || stream.buzy || stream.queue.length <= 0) return
                stream.buzy = true
                stream.stream.write(self.getDataString(stream.queue.shift(), true), 'utf8', error => {
                    if (!stream.error && error !== undefined && error !== null) stream.error = error
                    stream.buzy = false
                })
                find_for_write = true
            })

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            timer = setTimeout(tick, find_for_write ? 10 : 100)
        })
    }

    private getDataString(data: (string | any), root: boolean): string {
        if (Array.isArray(data) && root) {
            return data.map(m => { return this.getDataString(m, false) }).join('')
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

    private destroyStreams(): void {
        this.streams.forEach(stream => {
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