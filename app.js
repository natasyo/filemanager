"use strict";
import Filemanager from "./Filemanager.js";

let filemanager = new Filemanager();

process.on("SIGINT", () => {
    process.stdout.write(
        `Thank you for using File Manager, ${filemanager.username}, goodbye!\n`
    );
    process.exit();
});

process.stdin.on("data", (data) => {
    let str = data.toString();
    str = str.trim().split(" ");
    let command = str[0];
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
});
