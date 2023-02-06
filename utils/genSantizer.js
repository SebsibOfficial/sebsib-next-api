var xss = require('xss');

const sanitizeAll = (input) => {
    if (typeof (input) === 'string') {
        var SInput = xss(input.replace(/[:{}";\s]/g, ' '));
        return SInput;
    } else return input;
}

const checkFaultyAnswers = (input) => {
    if (typeof (input) === 'string') {
        return isFaulty(input);
    }

    if (Array.isArray(input)) {
        var faulty = [];

        input.forEach((element) => {
            faulty.push(isFaulty(element));
        });
        return faulty.includes(true);
    }
}

const isFaulty = (input) => {
    if (input.includes(':') || input.includes('{') || input.includes('}') || input.includes('"') || input.includes(';')) return true;

    return false;
}


module.exports = { sanitizeAll, checkFaultyAnswers };