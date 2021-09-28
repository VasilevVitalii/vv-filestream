import { WriteStream } from "./app"

export type TypeWriteStreamOptions = {
    //data that can be written to the beginning of the file; only if data will be written to the file
    prefix?: string,
    //data that can be written to the end of the file; only if data will be written to the file
    suffix?: string,
}

export type TypeWrite = {
    fullFileName: string,
    data: string | any
}

export type TypeResult = {
    fullFileName: string,
    error: Error
}

export function createWriteStream(options: TypeWriteStreamOptions): WriteStream  {
    return new WriteStream(options)
}