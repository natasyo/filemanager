("use strict");
import os from "os";
import { createReadStream, appendFile, createWriteStream } from "fs";
import { readdir, access, constants, rename } from "fs/promises";
import * as path from "path";

const INVALID_INPUT = "Invalid input";
function tableFiles(filename, type) {
    this.filename = filename;
    this.type = type;
}

class Filemanager {
    constructor() {
        this.homedir = os.homedir();
        this.username = process.argv[2].replace("--", "").split("=")[1];
        this.setCurrentDir(this.homedir)
            .then()
            .catch((err) => {
                console.log(err);
            });
    }
    async setCurrentDir(path) {
        this.currentDir = path;
        this.currentFiles = await readdir(path, { withFileTypes: true });
        process.stdout.write(`You are currently in ${this.currentDir}\n`);
    }
    ls(files) {
        if (!files) files = this.currentFiles;
        let filesArray = files.map((file) => {
            let type = file.isDirectory() ? "directory" : "file";
            return new tableFiles(file.name, type);
        });
        console.table(filesArray);
    }
    up() {
        this.setCurrentDir(path.resolve(this.currentDir, "../"));
    }
    async cd(pathToGo) {
        let currentDir = path.resolve(this.currentDir, pathToGo);
        access(currentDir, constants.F_OK)
            .then(
                () => {
                    this.setCurrentDir(currentDir);
                },
                () => {
                    process.stdout.write(`Durectory ${currentDir} not found`);
                }
            )
            .catch(() => console.log("Error"));
    }

    async cat(pathToFile) {
        if (pathToFile) {
            let filePath = path.resolve(this.currentDir, pathToFile);

            try {
                const readStream = createReadStream(filePath, "utf-8");
                readStream.on("data", (data) => {
                    process.stdout.write(data);
                });
                readStream.on("error", (err) => {
                    process.stdout.write(err);
                });
            } catch (e) {
                process.stdout.write(e.message);
            }
        }
    }
    async add(filename) {
        try {
            await appendFile(
                path.resolve(this.currentDir, filename),
                "",
                async (err) => {
                    if (!err) {
                        await this.setCurrentDir(this.currentDir);
                    }
                    console.log(err);
                }
            );
        } catch (e) {
            console.log(`${e.message}\n`);
        }
    }
    async rn(fileName, newFileName) {
        try {
            let name = path.resolve(this.currentDir, fileName);
            let newName = path.resolve(this.currentDir, newFileName);
            await rename(name, newName);
        } catch (e) {
            process.stdout.write(e.message);
        }
    }
    async cp(pathToFile, pathNewDirectory) {
        try {
            if (arguments.length !== 2) {
                process.stdout.write(`${INVALID_INPUT}\n`);
                return;
            }
            const pathFile = path.resolve(this.currentDir, pathToFile);
            const newPathFile = path.join(
                path.resolve(this.currentDir, pathNewDirectory),
                path.basename(pathToFile)
            );
            const readStream = createReadStream(pathFile);
            readStream.on("error", (err) => {
                if (!err) {
                    const writeStream = createWriteStream(newPathFile);
                    readStream.pipe(writeStream).on("error", (err) => {
                        process.stdout.write(`${err.message}\n`);
                    });
                } else {
                    process.stdout.write(`${err.message}\n`);
                }
            });
        } catch (e) {
            process.stdout.write(`${e.message}\n`);
        }
    }
    async mv(pathToFile, pathNewDirectory) {
        try {
            if (await this.cp(pathToFile, pathNewDirectory)) {
                console.log("ok");
            }
        } catch (e) {
            process.stdout.write(`${e.message}\n`);
        }
    }
}

export default Filemanager;
