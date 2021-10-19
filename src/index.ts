import { WriteStream } from "./app"

export type TWriteStreamOptions = {
    //for write mode = 'create', data that can be written to the beginning of the file; only if data will be written to the file
    prefix?: string,
    //for write mode = 'create', data that can be written to the end of the file; only if data will be written to the file
    suffix?: string,
}

export function Create(options: TWriteStreamOptions): WriteStream  {
    return new WriteStream(options)
}