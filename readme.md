# level-modify

[![npm](https://img.shields.io/npm/v/level-modify.svg)](https://www.npmjs.com/package/level-modify)

Modify an existing key in a levelup store. Uses [level-lock](https://www.npmjs.com/package/level-lock) to prevent race conditions. See also: [level-create](https://www.npmjs.com/package/level-create), [level-move](https://www.npmjs.com/package/level-move)

```js
let db = require('level')('colors.db')
let modify = require('level-modify');

function redToBlue(color) {
	if (color === 'red') color = 'blue';
	return color;
}

db.put('fence', 'red', (err) => {
	modify(db, 'fence', redToBlue, (err) => {
		if (err && err.code === 'LOCKED') return console.error('conflict');
		db.get('fence', (err, color) => {
			console.log(color); // blue
		});
	});
});
```


### Methods

###### let modify = require('level-modify');
###### modify(db, key, mod, callback));

Modify the value at `key`. `mod` can be a function in the form of `function(oldValue) {return newValue;}` or an object which will be merged with the old value like so: `Object.assign(oldValue, mod);`

If the key is write-locked by a concurrent operation an error will be given to the callback with `err.code` being `'LOCKED'`. Like other levelup methods if callback is omitted errors will be thrown.

Alternatively install onto the db object:

###### require('level-modify').install(db);
###### db.modify(key, mod, callback);


## License

MIT