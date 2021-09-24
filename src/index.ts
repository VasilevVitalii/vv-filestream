// import { TypeOptions, Env, TypeChannelWorkerFrom, TypeChannelWorkerTo, TypeChannelStateFilterObtain, TypeChannelStateFilterQuery, TypeStateRowChange, TypeSetCallback, TypeStateRow }  from './index.env'
// export type {TypeChannelStateFilterObtain, TypeChannelStateFilterQuery, TypeStateRow, TypeStateRowChange, TypeSetCallback}

import * as fs from 'fs'

import { build, TypeWriteStreamOptions, TypeWriteStreamOptionsInternal } from "./options";
export { TypeWriteStreamOptions }

export type TypeCallbackResult = {error: Error}

export class WriteStream {
    private options: TypeWriteStreamOptionsInternal
    private stream: fs.WriteStream
    private callback_onClose: (error: Error, result: TypeCallbackResult) => void
    private error: Error
    private closed: boolean
    private queue: string[]
    private first_write: boolean

    constructor(options: TypeWriteStreamOptions) {
        this.options = build(options)
        this.closed = false
        this.queue = []
        this.timer()
        this.first_write = true
        this.stream = fs.createWriteStream(this.options.fullFileName, 'utf8')
        this.stream.on('error', error => {
            if (!this.error) this.error = error
        })
    }

    write(data: string): void {
        if (this.error || this.closed) return
        if (this.first_write) {
            if (this.options.prefix) {
                this.queue.push(this.options.prefix)
            }
            this.first_write = false
        }
        this.queue.push(data)
    }

    close(): void {
        this.closed = true
    }

    onClose(callback: (error: Error, result: TypeCallbackResult) => void): void {
        this.callback_onClose = callback
    }

    private timer() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let self = this
        setTimeout(function tick() {
            if (!self) return

            if (self.error) {
                if (self.callback_onClose) {
                    self.callback_onClose(self.error, undefined)
                }
                self.destroy()
                self = undefined
                return
            }

            if (self.queue.length <= 0) {
                if (self.closed) {
                    self.beforeSuccessClose([], 0, error => {
                        if (self.callback_onClose) {
                            self.callback_onClose(error, undefined)
                        }
                        self.destroy()
                        self = undefined
                    })
                } else {
                    setTimeout(tick, 100)
                }
                return
            }

            const data = self.queue.shift()
            try {
                self.stream.write(data, 'utf8', error => {
                    if (error && !self.error) {
                        self.error = error
                    }
                    setTimeout(tick, 0)
                })
            // eslint-disable-next-line no-empty
            } catch(error) {
                setTimeout(tick, 0)
            }
        }, 100)
    }

    private beforeSuccessClose(steps: string[], idx: number, callback: (error: Error) => void): void {
        if (idx > steps.length) {
            callback(undefined)
            return
        }
    }

    private destroy(): void {
        this.queue = []
        if (!this.stream) return
        try {
            this.stream.close()
        // eslint-disable-next-line no-empty
        } catch (error) {}
        try {
            this.stream.destroy()
        // eslint-disable-next-line no-empty
        } catch (error) {}
        try {
            this.stream = undefined
        // eslint-disable-next-line no-empty
        } catch (error) {}
    }
}