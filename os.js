import os from "os";
export default class OS {
    static EOL() {
        process.stdout.write(`${os.EOL}\n`);
    }
    static cpus() {
        process.stdout.write(`${os.cpus()}\n`);
    }
    static homedir() {
        process.stdout.write(`${os.homedir()}\n`);
        return os.homedir();
    }
    static username() {
        process.stdout.write(`${os.userInfo().username}\n`);
    }
    static architecture() {
        process.stdout.write(`${os.arch()}\n`);
    }
}
