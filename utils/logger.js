/**
 * Simple colored logger utility for the bot.
 */
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
};

function timestamp() {
    return new Date().toLocaleString('en-US', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

module.exports = {
    info: (message, ...args) => {
        console.log(`${colors.gray}[${timestamp()}]${colors.blue} [INFO]${colors.reset} ${message}`, ...args);
    },
    success: (message, ...args) => {
        console.log(`${colors.gray}[${timestamp()}]${colors.green} [SUCCESS]${colors.reset} ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`${colors.gray}[${timestamp()}]${colors.yellow} [WARN]${colors.reset} ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`${colors.gray}[${timestamp()}]${colors.red} [ERROR]${colors.reset} ${message}`, ...args);
    },
    debug: (message, ...args) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`${colors.gray}[${timestamp()}]${colors.magenta} [DEBUG]${colors.reset} ${message}`, ...args);
        }
    },
    command: (commandName, user, guild) => {
        console.log(
            `${colors.gray}[${timestamp()}]${colors.cyan} [CMD]${colors.reset} /${commandName} used by ${user} in ${guild}`
        );
    },
};
