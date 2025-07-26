
class ApiError extends Error {
    public statusCode: number;
    public message: string;
    public success: boolean = false;
    public errors: Array<{ 
      message: string; 
      field?: string 
    }> = [];
    public stack: string = "";
    constructor(
        statusCode: number = 500,
        message: string = "Something went wrong",
        stack = "",
        errors = []
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
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