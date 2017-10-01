class Configuration {
    get MOCK_POURS () { return false };
    get USER_TIMEOUT() { return 15000 };
}

module.exports = new Configuration();