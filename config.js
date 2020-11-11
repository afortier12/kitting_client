const dotenv = require("./lib/js/dotenv.js").config();

module.exports = {
    NODE_ENV: process.env.NODE_ENV || "development",
    HOST: process.env.HOST || "localhost",
    PORT: process.env.PORT || 9091,
    API_PROTOCOL: process.env.API_PROTOCOL || "http",
    API_HOST: process.env.API_HOST || "localhost",
    API_PORT: process.env.API_PORT || 1880,
    API_PATH: process.env.API_PATH || "/",
    WS_HOST: process.env.WS_HOST || "localhost",
    WS_PORT: process.env.WS_PORT || 8201,
};
