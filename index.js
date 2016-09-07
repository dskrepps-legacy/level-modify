var lock = require('level-lock');

module.exports = levelModify;
levelModify.install = install;

/**
 * @param {LevelUp} db
 * @param {*} key
 * @param {Function(*)|Object} mod - Function to transform existing value, or
 *  an object to be merged with the existing value using Object.assign.
 * @param {Callback} [cb] - If omitted any errors will be thrown.
 */
function levelModify(db, key, mod, cb) {
	if (!cb) {
		cb = function levelModifyErr(err) {
			if (err) throw err;
		};
	}
	
	var unlock = lock(db, key, 'w');
	if (!unlock) {
		var err = new Error('key is write-locked');
		err.code = err.type = 'LOCKED';
		return setImmediate(cb, err);
	}
	
	db.get(key, function onGet(err, oldValue) {
		if (err) {
			unlock();
			return cb(err);
		}
		
		var newValue;
		if (typeof mod === 'function') {
			newValue = mod(oldValue);
		} else {
			newValue = Object.assign(oldValue, mod);
		}
		
		db.put(key, newValue, function onPut(err) {
			unlock();
			cb(err);
		});
	});
}

function install(db) {
	db.modify = levelModify.bind(null, db);
}
