("use strict");
import os from "os";
import { createReadStream, appendFile, createWriteStream, exists } from "fs";
import {
    readdir,
    access,
    constants,
    rename,
    unlink,
    readFile,
} from "fs/promises";
import path from "path";
import Constants from "./Constants.js";
import { createHash } from "node:crypto";
import Check from "./Check.js";

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
            `\n Welcome to the File Manager, ${this.username}!\n`
        );
    }

    async setCurrentDir(path) {
        if (Check.checkCommand(arguments, 1)) {
            this.currentDir = path;
            this.currentFiles = await readdir(path, { withFileTypes: true });
            process.stdout.write(`\nYou are currently in ${this.currentDir}>`);
        }
    }
    ls(files) {
        if (Check.checkCommand(arguments, 1)) {
            if (!files) files = this.currentFiles;
            let filesArray = files.map((file) => {
                let type = file.isDirectory() ? "directory" : "file";
                return new tableFiles(file.name, type);
            });
            console.table(filesArray);
        }
    }
    up() {
        if (Check.checkCommand(arguments, 0)) {
            this.setCurrentDir(path.resolve(this.currentDir, "../"));
        }
    }
    async cd(pathToGo) {
        if (Check.checkCommand(arguments, 1)) {
            let currentDir = path.resolve(this.currentDir, pathToGo);
            access(currentDir, constants.F_OK)
                .then(
                    () => {
                        this.setCurrentDir(currentDir);
                    },
                    () => {
                        process.stdout.write(
                            `Directory ${currentDir} not found`
                        );
                    }
                )
                .catch(() => console.log("Error"));
        }
    }

    async cat(pathToFile) {
        if (Check.checkCommand(arguments, 1)) {
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
    }
    async add(filename) {
        if (Check.checkCommand(arguments, 1)) {
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
                console.log(`\n${e.message}\n`);
            }
        }
    }
    async rn(fileName, newFileName) {
        if (Check.checkCommand(arguments, 2)) {
            try {
                let name = path.resolve(this.currentDir, fileName);
                let newName = path.resolve(this.currentDir, newFileName);
                await rename(name, newName);
            } catch (e) {
                process.stdout.write(e.message);
            }
        }
    }

    async cp(pathToFile, pathNewDirectory) {
        if (Check.checkCommand(arguments, 2)) {
            try {
                if (arguments.length !== 2) {
                    process.stdout.write(`\n${Constants.INVALID_INPUT} \n`);
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
                    .on("error", Check.showError)
                    .pipe(
                        writeStream
                            .on("finish", () => {
                                process.stdout.write(
                                    `file ${path.basename(
                                        pathToFile
                                    )} copied successfully`
                                );
                            })
                            .on("error", Check.showError)
                    )
                    .on("error", Check.showError);
            } catch (e) {
                process.stdout.write(`${e.message}\n`);
            }
        }
    }
    async mv(pathToFile, pathNewDirectory) {
        if (Check.checkCommand(arguments, 2)) {
            try {
                const pathFile = path.resolve(this.currentDir, pathToFile);
                const newPathFile = path.join(
                    path.resolve(this.currentDir, pathNewDirectory),
                    path.basename(pathToFile)
                );
                const readStream = createReadStream(pathFile);
                const writeStream = createWriteStream(newPathFile);
                readStream
                    .on("error", Check.showError)
                    .pipe(
                        writeStream
                            .on("finish", () => {
                                process.stdout.write(
                                    `\nfile ${path.basename(
                                        pathToFile
                                    )} moved successfully\n`
                                );
                                unlink(pathFile).catch(Check.showError);
                            })
                            .on("error", Check.showError)
                    )
                    .on("error", Check.showError);
            } catch (e) {
                process.stdout.write(`${e.message}\n`);
            }
        }
    }
    async rm(fileName) {
        if (Check.checkCommand(arguments, 1)) {
            unlink(fileName)
                .then(() => {
                    process.stdout.write(
                        `\nfile ${path.basename(
                            fileName
                        )} removed successfully\n`
                    );
                })
                .catch(Filemanager.showError);
            return 0;
        }
    }
    hash(filename) {
        if (Check.checkCommand(arguments, 1)) {
            exists(path.resolve(this.currentDir, filename), async (exists) => {
                if (exists) {
                    let content = await readFile(
                        path.resolve(this.currentDir, filename)
                    );
                    const heshSum = createHash("sha256");
                    heshSum.update(content);
                    process.stdout.write(`${heshSum.digest("hex")}\n`);
                }
            });
        }
    }
}

export default Filemanager;
