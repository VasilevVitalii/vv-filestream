export type TypeWriteStreamOptions = {
    //full file name for write data
    fullFileName: string,
    //data that can be written to the beginning of the file; only if data will be written to the file
    prefix?: string,
    //data that can be written to the end of the file; only if data will be written to the file
    suffix?: string,
    //delete the file if no data was written to it
    delete_empty_file?: boolean
}

export type TypeWriteStreamOptionsInternal = {
    fullFileName: string,
    prefix: string,
    suffix: string,
    delete_empty_file: boolean
}

export function build(options: TypeWriteStreamOptions): TypeWriteStreamOptionsInternal {
    if (!options || !options.fullFileName) return undefined
    return {
        fullFileName: options.fullFileName,
        delete_empty_file: options.delete_empty_file === true || options.delete_empty_file === false ? options.delete_empty_file : false,
        prefix: options.prefix,
        suffix: options.suffix
    }
}