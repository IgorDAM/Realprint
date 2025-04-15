const logger = require('../utils/logger');

class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const handleJWTError = () => new AppError('Token inválido. Por favor, inicie sesión nuevamente', 401, 'AUTH_001');

const handleJWTExpiredError = () => new AppError('Su sesión ha expirado. Por favor, inicie sesión nuevamente', 401, 'AUTH_002');

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Datos inválidos. ${errors.join('. ')}`;
    return new AppError(message, 400, 'VALIDATION_001');
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Valor duplicado: ${value}. Por favor, use otro valor`;
    return new AppError(message, 400, 'DB_001');
};

const handleCastErrorDB = (err) => {
    const message = `Valor inválido ${err.path}: ${err.value}`;
    return new AppError(message, 400, 'DB_002');
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            code: err.errorCode
        });
    } else {
        logger.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Algo salió mal',
            code: 'INTERNAL_001'
        });
    }
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

module.exports = {
    AppError,
    errorHandler
}; 