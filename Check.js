import Constants from "./Constants.js";
import Filemanager from "./Filemanager.js";

export default class Check {
    static checkCommand(arg, countArg) {
        if (arg.length !== countArg) {
            process.stdout.write(Constants.INVALID_INPUT);
            Filemanager.showCurrentDir();
            return false;
        }
        return true;
    }
    static showError(err) {
        process.stdout.write(`Operation failed: ${err.message}`);
    }
}
