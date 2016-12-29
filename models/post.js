var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/xblog';

//Post对象构造函数
function Post(username, title, content, time) {
	this.username = username;
	this.title = title;
	this.content = content;
	this.brief = brief(content, 100);
	if (time) {
		this.time = time;
	} else {
		this.time = new Date().Format("yyyy-MM-dd hh:mm");
	}
	this.words = this.content.length;
}

module.exports = Post;

Post.prototype.save = function save(callback) {
	//存入mongodb中的文档
	var post = {
		username: this.username,
		title: this.title,
		content: this.content,
		brief: this.brief,
		time: this.time,
		words: this.words
	};

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
	  	console.log("Connected correctly to server");

	  	//读取posts集合
		db.collection('posts', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			//为user属性添加索引
			collection.ensureIndex('username');
			//写入post文档
			collection.insert(post, {safe: true}, function(err, post) {
				db.close();
				callback(err, post);
			});
		});
			
  		db.close();
	});
};

//更新文章,后续添加修改功能时用到
Post.prototype.update = function update(callback) {
	//存入mongodb中的文档
	var post = {
		_id: this._id,
		username: this.username,
		title: this.title,
		brief: this.brief,
		content: this.content,
		time: this.time,
		words: this.content.length
	};

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);

	  //读取posts集合
		db.collection('posts', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			//更新post文档
			collection.update({username: this.username}, post, function(err, post) {
				db.close();
				callback(err, post);
			});
		});
	});
}

//添加get方法
Post.get = function get(username, callback) {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);

	  //读取posts集合
		db.collection('posts', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			//查找user属性为username的文档
			var query = {};
			if (username) {
				query.username = username;
			}
			collection.find(query).sort({time: -1}).toArray(function(err, docs) {
				db.close();
				if (err) {
					callback(err, null);
				}

				//封装posts为Post对象
				var posts = [];
				docs.forEach(function(doc, index) {
					var post = {
						_id: doc._id,
						username: doc.username,
						title: doc.title,
						brief: doc.brief,
						time: doc.time,
					};
					posts.push(post);
				});

				callback(null, posts);
			});
		});
	});
};

//查询文章
Post.search = function search(id, callback) {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);

	  //读取posts集合
		db.collection('posts', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			//按_id查找文章
			collection.findOne({"_id": ObjectId(id)}, function(err, doc) {				
				db.close();
				if (err) {
					callback(err, null);
				}
				//实例化返回的post
				var post = {
					_id: doc._id,
					username: doc.username,
					title: doc.title,
					content: doc.content,
					time: doc.time
				}
				
				callback(null, post);
			});
		});
	});
};

//时间格式化
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)){
     fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o){
	    if (new RegExp("(" + k + ")").test(fmt)) {
	    	fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	    }
	}
    return fmt;
}

//文章生成摘要,简易算法,只是截取开头指定长度
function brief(text, length){
	 var elem = /<(\/?)(|P|DIV|H1|H2|H3|H4|H5|H6|ADDRESS|PRE|TABLE|TR|TD|TH|INPUT|SELECT|TEXTAREA|OBJECT|A|UL|OL|LI|BASE|META|LINK|HR|BR|PARAM|IMG|AREA|INPUT|SPAN)[^>]*(>?)/ig;
     var clean = text.replace(elem, '').replace(/\s+/g, '');
     var brief = clean.substr(0, length);
     brief = brief + '...';

     return brief;
 }

