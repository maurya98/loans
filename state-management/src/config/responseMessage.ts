export default {
    SUCCESS: {
        status: true,
        statusCode: 200,
        message: "SUCCESS"
    },
    PARTIAL: {
        status: "partial-success",
        statusCode: 206,
        message: "PARTIAL-SUCCESS"
    },
    ERROR: {
        status: false,
        statusCode: 400,
        message: "ERROR"
    },
    "DB-ERROR": {
        status: false,
        statusCode: 500,
        message: "DB-ERROR"
    },
}
