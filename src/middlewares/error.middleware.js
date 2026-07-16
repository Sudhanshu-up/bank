const errorHandler = (err, req, res, next)=>{
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success:false,
        message:message,
        errors:err.errors || [],
        stack: process.env.NODE_ENV === "development" ? null : err.stack
    });
};

export default errorHandler;