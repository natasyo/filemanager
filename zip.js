import fs from "fs";
import { mkdir } from "fs/promises";
import * as path from "path";
import zlib from "zlib";
import Check from "./Check.js";
import Constants from "./Constants.js";
import Filemanager from "./Filemanager.js";

export default class ZIP {
    static async compress(path_to_file, path_to_destination) {
        if (arguments.length !== 2) {
            process.stdout.write(`${Constants.INVALID_INPUT} \n`);
            Filemanager.showCurrentDir();
            return 0;
        }
        try {
            const file = path.resolve(Filemanager.currentDir, path_to_file);
            const rar = path.resolve(
                Filemanager.currentDir,
                path_to_destination
            );
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
                    Filemanager.setCurrentDir();
                });
            });
        } catch (e) {
            Check.showError(e);
        }
    }
    static decompress(path_to_file, path_to_destination) {
        if (arguments.length !== 2) {
            process.stdout.write(`${Constants.INVALID_INPUT}\n`);
            Filemanager.showCurrentDir();
            return 0;
        }
        try {
            const fileRar = path.resolve(Filemanager.currentDir, path_to_file);
            const pathToFile = path.resolve(
                Filemanager.currentDir,
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
                    Filemanager.showCurrentDir();
                });
            });
        } catch (e) {
            Check.showError(e);
        }
    }
}
