class Configuration {
    get MOCK_POURS () { return true };
    get USER_TIMEOUT() { return 15000 };
}

module.exports = new Configuration();