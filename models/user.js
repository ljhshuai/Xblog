var MongoClient = require('mongodb').MongoClient;

var assert = require('assert');

//数据库url
var url = 'mongodb://localhost:27017/xblog';

//user构造函数
function User(user) {
	this.account = user.account;
	this.name = user.name;
	this.password = user.password;
	//账号是否被激活
	this.active = user.active;
	//激活码
	this.activeWord = user.activeWord;
	//关注粉丝文章字数赞
	this.followings = user.followings;
	this.followers = user.followers;	
	this.posts = user.posts;
	this.words = user.words;
	this.goods = user.goods;
};

//导出User模块
module.exports = User;

//User原型添加save方法
User.prototype.save = function save(callback) {
	// 存入 Mongodb 的文档
	var user = {
		account: this.account,
		name: this.name,
		password: this.password,
		active: this.active,
		activeWord: this.activeWord,
		followings: this.followings,
		followers: this.followers,
		posts: this.posts,
		words: this.words,
		goods: this.goods
	};
	//连接数据库
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		//读取users集合
  	db.collection('users', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			// 为 name 属性添加索引
			collection.ensureIndex('name', {unique: true});
			// 写入 user 文档
			collection.insert(user, {safe: true}, function(err, user) {
				db.close();
				callback(err, user);
			});
		});
	});
};

//User原型添加update方法
User.prototype.update = function update(callback) {
	// 存入 Mongodb 的文档
	var user = {
		account: this.account,
		name: this.name,
		password: this.password,
		active: this.active,
		activeWord: this.activeWord,
		followings: this.followings,
		followers: this.followers,
		posts: this.posts,
		words: this.words,
		goods: this.goods
	};

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);

		// 读取 users 集合
		db.collection('users', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			// 更新 user 文档
			collection.update({name: user.name}, user, function(err, user) {
				db.close();
				callback(err, user);
			});
		});
	});
};

//User添加get方法
User.get = function get() {
	var callback;
	var search;
	//根据传入参数个数来确定查询条件
	if (arguments.length === 2 && typeof arguments[1] === 'function') {
		callback = arguments[1];
		//登录时只输入一个用户名/邮箱
		search = {"$or": [ {name: arguments[0]}, {account: arguments[0]} ]};
	}
	if (arguments.length === 3 && typeof arguments[2] === 'function') {
		callback = arguments[2];
		//注册时输入邮箱和用户名
		search = {"$or": [ {name: arguments[1]}, {account: arguments[0]} ]};
	}

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);

		// 读取 users 集合
		db.collection('users', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			// 查找
			collection.findOne(search, function(err, doc) {
				db.close();
				if (doc) {
					// 封装文档为 User 对象
					var user = new User(doc);
					callback(err, user);
				} else {
					callback(err, null);
				}
			});
		});
	});
};