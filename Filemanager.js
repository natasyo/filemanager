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
        Filemanager.setCurrentDir(this.homedir)
            .then()
            .catch((err) => {
                console.log(err);
            });
        process.stdout.write(
            `\n Welcome to the File Manager, ${this.username}!\n`
        );
    }
    static showCurrentDir() {
        process.stdout.write(
            `\nYou are currently in ${Filemanager.currentDir}>`
        );
    }
    static async setCurrentDir(path) {
        if (Check.checkCommand(arguments, 1)) {
            Filemanager.currentDir = path;
            Filemanager.currentFiles = await readdir(path, {
                withFileTypes: true,
            });
            Filemanager.showCurrentDir();
        }
    }
    ls(files) {
        if (!files) files = Filemanager.currentFiles;
        let filesArray = files.map((file) => {
            let type = file.isDirectory() ? "directory" : "file";
            return new tableFiles(file.name, type);
        });
        console.table(filesArray);
        Filemanager.showCurrentDir();
    }
    up() {
        if (Check.checkCommand(arguments, 0)) {
            Filemanager.setCurrentDir(
                path.resolve(Filemanager.currentDir, "../")
            );
        }
    }
    async cd(pathToGo) {
        if (Check.checkCommand(arguments, 1)) {
            let currentDir = path.resolve(Filemanager.currentDir, pathToGo);
            access(currentDir, constants.F_OK)
                .then(
                    () => {
                        Filemanager.setCurrentDir(currentDir);
                    },
                    () => {
                        process.stdout.write(
                            `Directory ${currentDir} not found\n`
                        );
                        Filemanager.showCurrentDir();
                    }
                )
                .catch((e) => {
                    Check.showError(e);
                    Filemanager.showCurrentDir();
                });
        }
    }

    async cat(pathToFile) {
        if (Check.checkCommand(arguments, 1)) {
            if (pathToFile) {
                let filePath = path.resolve(Filemanager.currentDir, pathToFile);

                try {
                    const readStream = createReadStream(filePath, "utf-8");
                    readStream.on("data", (data) => {
                        process.stdout.write(data);
                        Filemanager.showCurrentDir();
                    });
                    readStream.on("error", (err) => {
                        Check.showError(err);
                        Filemanager.showCurrentDir();
                        return;
                    });
                } catch (e) {
                    Check.showError(e);
                    Filemanager.showCurrentDir();
                }
            }
        }
    }
    async add(filename) {
        if (Check.checkCommand(arguments, 1)) {
            try {
                await appendFile(
                    path.resolve(Filemanager.currentDir, filename),
                    "",
                    async (err) => {
                        if (!err) {
                            await Filemanager.setCurrentDir(
                                Filemanager.currentDir
                            );
                            return;
                        }
                        Check.showError(err);
                    }
                );
            } catch (e) {
                Check.showError(e);
                Filemanager.showCurrentDir();
            }
        }
    }
    async rn(fileName, newFileName) {
        if (Check.checkCommand(arguments, 2)) {
            try {
                let name = path.resolve(Filemanager.currentDir, fileName);
                let newName = path.resolve(Filemanager.currentDir, newFileName);
                await rename(name, newName);
                process.stdout.write(`\nSuccess\n`);
                Filemanager.showCurrentDir();
            } catch (e) {
                process.stdout.write(e.message);
                Filemanager.showCurrentDir();
            }
        }
    }

    async cp(pathToFile, pathNewDirectory) {
        if (Check.checkCommand(arguments, 2)) {
            try {
                const pathFile = path.resolve(
                    Filemanager.currentDir,
                    pathToFile
                );
                const newPathFile = path.join(
                    path.resolve(Filemanager.currentDir, pathNewDirectory),
                    path.basename(pathToFile)
                );
                const readStream = createReadStream(pathFile);
                const writeStream = createWriteStream(newPathFile);
                readStream
                    .on("error", Check.showError)
                    .pipe(
                        writeStream.on("finish", () => {
                            process.stdout.write(
                                `file ${path.basename(
                                    pathToFile
                                )} copied successfully`
                            );
                            Filemanager.showCurrentDir();
                        })
                    )
                    .on("error", (err) => {
                        Check.showError(err);
                        Filemanager.showCurrentDir();
                    });
            } catch (e) {
                Check.showError(e);
                Filemanager.showCurrentDir();
            }
        }
    }
    async mv(pathToFile, pathNewDirectory) {
        if (Check.checkCommand(arguments, 2)) {
            try {
                const pathFile = path.resolve(
                    Filemanager.currentDir,
                    pathToFile
                );
                const newPathFile = path.join(
                    path.resolve(Filemanager.currentDir, pathNewDirectory),
                    path.basename(pathToFile)
                );
                const readStream = createReadStream(pathFile);
                const writeStream = createWriteStream(newPathFile);
                readStream
                    .on("error", Check.showError)
                    .pipe(
                        writeStream.on("finish", () => {
                            process.stdout.write(
                                `\nfile ${path.basename(
                                    pathToFile
                                )} moved successfully\n`
                            );
                            unlink(pathFile).catch(Check.showError);
                            Filemanager.showCurrentDir();
                        })
                    )
                    .on("error", () => {
                        Check.showError;
                        Filemanager.showCurrentDir();
                    });
            } catch (e) {
                Check.showError(e);
                Filemanager.showCurrentDir();
            }
        }
    }
    async rm(fileName) {
        if (Check.checkCommand(arguments, 1)) {
            unlink(path.resolve(Filemanager.currentDir, fileName))
                .then(() => {
                    process.stdout.write(
                        `\nfile ${path.basename(
                            fileName
                        )} removed successfully\n`
                    );
                    Filemanager.showCurrentDir();
                })
                .catch((e) => {
                    Check.showError(e);
                    Filemanager.showCurrentDir();
                });
            return 0;
        }
    }
    hash(filename) {
        if (Check.checkCommand(arguments, 1)) {
            exists(
                path.resolve(Filemanager.currentDir, filename),
                async (exists) => {
                    if (exists) {
                        let content = await readFile(
                            path.resolve(Filemanager.currentDir, filename)
                        );
                        const heshSum = createHash("sha256");
                        heshSum.update(content);
                        process.stdout.write(`${heshSum.digest("hex")}\n`);
                        Filemanager.showCurrentDir();
                    } else {
                        process.stdout.write(`\nFile not found\n`);
                        Filemanager.showCurrentDir();
                    }
                }
            );
        }
    }
}

export default Filemanager;
