var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');
var showdown = require('showdown');//处理markdown所需模块

//首页请求处理
router.get('/', function(req, res) {
  //读取所有的用户微博，传递把posts微博数据集传给首页
  Post.get(null, function (err, posts) {
    if (err) {
        posts = [];
    }
    //调用模板引擎，并传递参数给模板引擎
    res.render('index', {title: '首页', posts: posts});
  });
});

//注册请求处理
router.get('/reg', function(req, res) {
	res.render('reg', {title: '用户注册'})
});

router.post('/reg', function(req, res) {
	//简单的表单验证,后续再增强
	if (req.body.username === '' || req.body.account === '' || req.body.password === '') {
		req.flash('error', '输入框不能为空');
		return res.redirect('/reg');
	}
	//密码加密,MD5并不安全，后续再换
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	//实例化user对象
	var newUser = new User({
		account: req.body.account,
		name: req.body.username,
		password: password,
		followings: 0,
		followers: 0,
		posts: 0,
		words: 0,
		goods: 0
	});
	//检测用户是否存在
	User.get(newUser.account, newUser.name, function(err, user) {
		if (user) {
			//用户存在，这里后续可以增强是邮箱存在还是用户名存在
      err = '用户已存在';
    }
    if (err) {
    	//保存错误信息，用于界面显示提示
      req.flash('error', err);
      return res.redirect('/reg');
    }

    newUser.save(function (err) {
    	//用户名不存在时，保存记录到数据库
      if (err) {
          req.flash('error', err);
          return res.redirect('/reg');
      }
      req.session.user = newUser;//保存用户名，用于判断用户是否已登录
      req.flash('success', '注册成功');
      return res.redirect('/');
    });
	});
});

//登录请求处理
router.get('/login', function(req, res) {
	res.render('login', {title: '用户登录'});
});

router.post('/login', function(req, res) {
	//简单的表单验证,后续再增强
	if (req.body.account === '' || req.body.password === '') {
		req.flash('error', '输入框不能为空');
		return res.redirect('/login');
	}
	//密码加密后得到要验证的密码
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	//检查数据库是否有该用户
	User.get(req.body.account, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/login');
		}
		if (user.password === password) {
			req.flash('success', '登录成功');
			//使用session记录当前登录用户
			req.session.user = user;
			return res.redirect('/');
		} else {
			req.flash('error', '账号密码不匹配');
			return res.redirect('/login');
		}
	});	
});

//用户主页请求处理
router.get('/u/:user', function(req, res) {
	//根据请求中的参数获取user
	User.get(req.params.user, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/');
		}
		//用户存在则根据用户名获取其posts
		Post.get(user.name, function(err, posts) {
			if (err) {
				req.flash('error', err);
        return res.redirect('/');
			}
			//根据获取的posts来生成用户主页
			res.render('user', {title: '个人主页', posts: posts});
		});		
	});
});

//用户写文章请求处理,富文本编辑器
router.get('/writehtml', function(req, res) {
  res.render('writehtml', { title: '写文章' });
});

router.post('/posthtml', function(req, res) {
	//获取发表文章用户
	var user = new User(req.session.user);
	//实例化要存入数据库的文章
	var post = new Post(user.name, req.body.title, req.body.content);
	//保存文章
	post.save(function(err) {
		if (err) {
	    req.flash('error', err);
	    return res.redirect('/');    
	  }	
	});
	//用户发表文章数,字数增加
	user.posts += 1;
  user.words += post.words;
  //更新session.user
 	req.session.user = user;
 	//更新数据库中的user
  user.update(function(err) {
  	if (err) {
  		console.log('qwewqe');
      req.flash('error', err);
    }
    req.flash('success', '发表成功');
    return res.redirect('/u/' + user.name);
  });
});

//用户写文章请求处理,markdown编辑器,显示文章详情时支持不好
//不能自动换行,后续再完善
router.get('/writemd', function(req, res) {
  res.render('writemd', { title: '写文章' });
});

router.post('/postmd', function(req, res) {
	//获取发表文章用户
	var user = req.session.user;
	//将markdown解析成html
	var converter = new showdown.Converter();
	var mdContent = req.body.content;
	var htmlContent = converter.makeHtml(mdContent);
	//实例化要存入数据库的文章
	var post = new Post(user.name, req.body.title, htmlContent);
	//保存文章
	post.save(function(err) {
		if (err) {
	    req.flash('error', err);
	    return res.redirect('/');    
	  }	
	});
	//用户发表文章数,字数增加
	user.posts += 1;
  user.words += post.words;
  //更新session.user
 	req.session.user = user;
 	//更新数据库中的user
  user.update(function(err) {
  	if (err) {
      req.flash('error', err);
    }
    req.flash('success', '发表成功');
    return res.redirect('/u/' + user.name);
  });
});

router.get('/p/:time', function(req, res) {
	//暂时采用time查询,使用_id查询好像键值对的值不能是变量,还在学习
	Post.search(req.params.time, function(err, post) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}	
		res.render('postdetail', {title: '文章详情', post: post});
	});
});

//登出请求处理
router.get('/logout', function(req, res) {
	//将session中用户清除
	req.session.user = null;
	req.flash('success', '退出成功');
	res.redirect('/');
});

//导出router模块
module.exports = router;
