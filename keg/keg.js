var DB = require('nosql');

function Keg(db)
{
    this.nosql = DB.load(db);
}

function ExposeKeg(db) {
	return new Keg(db);
}

module.exports = ExposeKeg;