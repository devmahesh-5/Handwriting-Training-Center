
class ApiError extends Error {
    public statusCode: number;
    public data: unknown;
    public success: boolean;
    public errors: any[];
    constructor(
        statusCode: number = 500,
        message: string = "Something went wrong",
        stack = "",
        errors = []
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.success = false
        this.errors = errors;
        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}


export { ApiError }