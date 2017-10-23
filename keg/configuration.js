class Configuration {
    get MOCK_POURS () { return false };
    get USER_TIMEOUT() { return 15000 };
    get CALIBRATION_ML() { return 237 };
}

module.exports = new Configuration();