var test = require('tape');
var level = require('level-test')();
var db = level('test.db', { valueEncoding: 'json' });
var modify = require('../');


test('prepare', function (t) {
	db.batch([
		{type: 'put', key: 'clark', value: {occupation: 'reporter'}},
		{type: 'put', key: 'bruce', value: {occupation: 'billionaire'}},
	], t.end.bind(t));
});


test('modify value by merge', function (t) {
	t.plan(2);
	
	modify(db, 'clark', {alterego: 'superman'}, function (err) {
		t.ifError(err);
		db.get('clark', function (err, newValue) {
			t.deepEqual(newValue, {
				occupation: 'reporter',
				alterego: 'superman',
			});
		});
	});
});


test('modify value by function', function (t) {
	t.plan(2);
	
	function transform(oldValue) {
		return Object.assign(oldValue, {alterego: 'batman'});
	}
	
	modify(db, 'bruce', transform, function (err) {
		t.ifError(err);
		db.get('bruce', function (err, newValue) {
			t.deepEqual(newValue, {
				occupation: 'billionaire',
				alterego: 'batman',
			});
		});
	});
});


test('locks', function (t) {
    t.plan(2);
    
    modify(db, 'bruce', { todo: 'stop joker' }, function (err) {
        t.ifError(err);
    });
    
    modify(db, 'bruce', { todo: 'attend ball' }, function (err) {
        t.equal(err.code, 'LOCKED');
    });
});
