class Configuration {
    get IS_BOOTSTRAP_TEST () { return process.argv.slice(2).length > 0 && process.argv.slice(2)[0] == "test-bootstrap" }
    get IS_TEST_HOST () { return process.argv.slice(2).length > 0 && process.argv.slice(2)[0] == "test" }
    get MOCK_POURS () { return this.IS_BOOTSTRAP_TEST || this.IS_TEST_HOST };
    get USER_TIMEOUT() { return this.IS_TEST_HOST ? 3000 : 15000 };
    get CALIBRATION_ML() { return 237 };
    get DATABASE_DIR () { return this.IS_TEST_HOST ? "../kegberrydb_test" : "../kegberrydb" };
    get USERS_DB_FILE () { return this.DATABASE_DIR + "/users.nosql" };
    get POURS_DB_FILE () { return this.DATABASE_DIR + "/pours.nosql" };
    get KEG_DB_FILE () { return this.DATABASE_DIR + "/keg.nosql" };
    get TEMP_POLLING_SEC () { return 10 };
    get TEMP_POLLING_SCRIPT_LOCATION() { return "./keg/get_temperature.py" };
}

module.exports = new Configuration();