"use strict";
import Filemanager from "./Filemanager.js";
import OS from "./os.js";

let filemanager = new Filemanager();

process.on("SIGINT", () => {
    process.stdout.write(
        `Thank you for using File Manager, ${filemanager.username}, goodbye!\n`
    );
    process.exit();
});

process.stdin.on("data", async (data) => {
    try {
        let str = data.toString();
        str = str.trim().split(" ");
        let command = str[0];
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
                if (typeof filemanager[command] === "function") {
                    filemanager[command](...str);
                } else {
                    process.stdout.write("Invalid input\n");
                }
            } catch (e) {
                process.stdout.write(e);
            }
        }
        process.stdout.write(
            `You are currently in ${filemanager.currentDir} > `
        );
    } catch (e) {
        Filemanager.showError(e);
    }
});
