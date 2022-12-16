import Constants from "./Constants.js";

export default class Check {
    static checkCommand(arg, countArg) {
        if (arg.length !== countArg) {
            process.stdout.write(Constants.INVALID_INPUT);
            return false;
        }
        return true;
    }
    static showError(err) {
        process.stdout.write(`Operation failed: ${err.message}`);
    }
}
