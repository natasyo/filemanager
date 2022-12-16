import fs from "fs";
import { mkdir } from "fs/promises";
import * as path from "path";
import zlib from "zlib";
import Check from "./Check.js";
import Constants from "./Constants.js";
import OS from "./os.js";

export default class ZIP {
    constructor() {
        ZIP.currentDir = OS.homedir();
    }

    static async compress(path_to_file, path_to_destination) {
        if (arguments.length !== 2) {
            process.stdout.write(`${Constants.INVALID_INPUT} \n`);
            return 0;
        }
        try {
            const file = path.resolve(ZIP.currentDir, path_to_file);
            const rar = path.resolve(ZIP.currentDir, path_to_destination);
            fs.exists(rar, async (exists) => {
                if (!exists) {
                    await mkdir(rar);
                }
                const readStream = fs.createReadStream(file);
                const writeStream = fs.createWriteStream(
                    `${path.join(rar, path.basename(file))}.br`
                );
                const brotli = zlib.createBrotliCompress();
                const stream = readStream.pipe(brotli).pipe(writeStream);

                stream.on("finish", () => {
                    console.log("Done compressing 😎");
                });
            });
        } catch (e) {
            Check.showError(e);
        }
    }
    static decompress(path_to_file, path_to_destination) {
        if (arguments.length !== 2) {
            process.stdout.write(`${Constants.INVALID_INPUT}\n`);
            return 0;
        }
        try {
            const fileRar = path.resolve(ZIP.currentDir, path_to_file);
            const pathToFile = path.resolve(
                ZIP.currentDir,
                path_to_destination
            );

            fs.exists(pathToFile, async (exists) => {
                if (!exists) {
                    await mkdir(pathToFile);
                }
                console.log(
                    path.join(pathToFile, path.basename(pathToFile, ".br"))
                );
                const readStream = fs.createReadStream(fileRar);
                readStream.on("error", (error) => {
                    console.log(error);
                });
                const writeStream = fs.createWriteStream(
                    path.join(pathToFile, path.basename(path_to_file, ".br"))
                );
                const brotli = zlib.createBrotliDecompress();
                const stream = readStream.pipe(brotli).pipe(writeStream);
                stream.on("finish", () => {
                    console.log("Done decompressing 😎");
                });
            });
        } catch (e) {
            Check.showError(e);
        }
    }
}
