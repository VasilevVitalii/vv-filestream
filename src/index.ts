import * as fs from 'fs'

export type TypeWriteStreamOptions = {
    //data that can be written to the beginning of the file; only if data will be written to the file
    prefix?: string,
    //data that can be written to the end of the file; only if data will be written to the file
    suffix?: string,
}

export type TypeWrite = {
    fullFileName: string,
    data: string
}

type TypeStream = {
    fullFileName: string,
    stream: fs.WriteStream,
    buzy: boolean
    error: Error
}

export class WriteStream {
    private options: TypeWriteStreamOptions

    private streams: TypeStream[]

    private queue: TypeWrite[]

    private closed: boolean

    constructor(options: TypeWriteStreamOptions) {
        this.options = options
        this.closed = false
        this.queue = []
        this.timer()
    }

    write(options: TypeWrite): void {
        if (this.closed === true) return
        this.queue.push(options)
    }

    close() {
        this.closed = true
    }

    onClose() {

    }

    private timer() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        setTimeout(function tick() {
            if (self.queue.length <= 0) {
                if (self.closed === false) {
                    setTimeout(tick, 100)
                    return
                }
                //TODO closed!
            }


            setTimeout(tick, 0)
        })
    }

    private writeWizard (data: TypeWrite, callback: () => void) {
        let stream = this.streams.find(f => f.fullFileName === data.fullFileName)
        if (!stream) {
            stream = {
                fullFileName: data.fullFileName,
                stream: fs.createWriteStream(data.fullFileName, 'utf8'),
                buzy: false,
                error: undefined
            }
            stream.stream.on('error', error => {
                if (!stream.error) stream.error = error
            })
            this.streams.push(stream)
            if (this.options.prefix) {
                this.writeCore(stream, this.options.prefix, () => {
                    this.writeWizard(data, callback)
                })
                return
            }
        }
        this.writeCore(stream, data.data, callback)
    }

    private writeCore(stream: TypeStream, data: string, callback: () => void) {
        if (stream.error) {
            callback()
            return
        }
        if (stream.buzy) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this
            setTimeout(() => {
                self.writeCore (stream, data, callback)
            }, 100)
            return
        }

        stream.buzy = true
        stream.stream.write(data, 'utf8', error => {
            if (!stream.error) stream.error = error
            stream.buzy = false
            callback()
        })
    }
}