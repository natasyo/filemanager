("use strict");
import os from "os";
import { createReadStream, appendFile, createWriteStream } from "fs";
import { readdir, access, constants, rename, unlink } from "fs/promises";
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
        process.stdout.write(
            `Welcome to the File Manager, ${this.username}!\n`
        );
    }
    async setCurrentDir(path) {
        this.currentDir = path;
        this.currentFiles = await readdir(path, { withFileTypes: true });
        process.stdout.write(`You are currently in ${this.currentDir}>`);
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
    static showError(err) {
        process.stdout.write(` ${err.message}`);
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
            const writeStream = createWriteStream(newPathFile);
            readStream
                .on("error", Filemanager.showError)
                .pipe(
                    writeStream
                        .on("finish", () => {
                            process.stdout.write(
                                `file ${path.basename(
                                    pathToFile
                                )} copied successfully`
                            );
                        })
                        .on("error", Filemanager.showError)
                )
                .on("error", Filemanager.showError);
        } catch (e) {
            process.stdout.write(`${e.message}\n`);
        }
    }
    async mv(pathToFile, pathNewDirectory) {
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
            const writeStream = createWriteStream(newPathFile);
            readStream
                .on("error", Filemanager.showError)
                .pipe(
                    writeStream
                        .on("finish", () => {
                            process.stdout.write(
                                `file ${path.basename(
                                    pathToFile
                                )} moved successfully\n`
                            );
                            unlink(pathFile).catch(Filemanager.showError);
                        })
                        .on("error", Filemanager.showError)
                )
                .on("error", Filemanager.showError);
        } catch (e) {
            process.stdout.write(`${e.message}\n`);
        }
    }
    async rm(fileName) {
        if (arguments.length !== 1) {
            process.stdout.write(`${INVALID_INPUT}\n`);
            return 0;
        }
        unlink(fileName)
            .then(() => {
                process.stdout.write(
                    `file ${path.basename(fileName)} removed successfully\n`
                );
            })
            .catch(Filemanager.showError);
        return 0;
    }
}

export default Filemanager;
