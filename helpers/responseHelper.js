const successResponse = (res, data) => {
    return res.status(200).json({
        status: "success",
        data,
    });
};

const errorResponse = (res, message, statusCode = 400) => {
    return res.status(statusCode).json({
        status: "error",
        message,
    });
};

module.exports = { successResponse, errorResponse };
