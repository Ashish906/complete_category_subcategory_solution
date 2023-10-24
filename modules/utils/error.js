class CustomError extends Error {
    constructor(statusCode, message) {
        super(statusCode, message)
        this.statusCode = statusCode
        this.message = message
    }
}

module.exports = CustomError