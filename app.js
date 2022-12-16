"use strict";
import Constants from "./Constants.js";
import Filemanager from "./Filemanager.js";
import OS from "./os.js";
import ZIP from "./zip.js";

let filemanager = new Filemanager();

process.on("SIGINT", () => {
    process.stdout.write(
        `\nThank you for using File Manager, ${filemanager.username}, goodbye!\n`
    );
    process.exit(0);
});

process.stdin.on("data", async (data) => {
    try {
        let str = data.toString();
        str = str.trim().split(" ");
        let command = str[0];
        if (command === "exit") {
            process.exit(0);
            `\nThank you for using File Manager, ${filemanager.username}, goodbye!\n`;
            return;
        }
        if (
            command === "os" &&
            str.length === 2 &&
            str[1].indexOf("--") === 0
        ) {
            const param = str[1].replace("--", "");
            if (OS[param]) {
                OS[param]();
            }
        } else {
            str.shift();
            try {
                if (command === "compress" || command === "decompress") {
                    ZIP.currentDir = filemanager.currentDir;
                    if (typeof ZIP[command] === "function") {
                        await ZIP[command](...str);
                    }
                } else if (typeof filemanager[command] === "function") {
                    filemanager[command](...str);
                } else {
                    process.stdout.write(`${Constants.INVALID_INPUT}\n`);
                }
            } catch (e) {
                process.stdout.write(e);
            }
        }
    } catch (e) {
        Filemanager.showError(e);
    }
});
