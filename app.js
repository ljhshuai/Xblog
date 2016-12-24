//引入所需模块
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var setting = require('./setting');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var index = require('./routes/index');
var users = require('./routes/users');

//创建express实例
var app = express();

// 设置模板目录及引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//使用flash中间件
app.use(flash());

//放置网站图标后去注释
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//默认使用的中间件
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//使用session会话中间件
app.use(session({
	//会话密钥
	secret: setting.cookieSecret,
	//会话存储数据库
	store: new MongoStore({url: 'mongodb://localhost/xblog'})
}));

// 视图交互：实现用户不同登陆状态下显示不同的页面及显示登陆注册等时的成功和错误等提示信息
app.use(function(req, res, next){
    console.log("app.usr local");
    //res.locals.xxx实现xxx变量全局化，在其他页面直接访问变量名即可
    //访问session数据：用户信息
    res.locals.user = req.session.user;
    //获取要显示错误信息
    var error = req.flash('error');//获取flash中存储的error信息
    res.locals.error = error.length ? error : null;
    //获取要显示成功信息
    var success = req.flash('success');
    res.locals.success = success.length ? success : null;
    next();//控制权转移，继续执行下一个app.use()
});

//使用路由
app.use('/', index);

//404错误处理
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//其他错误处理
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//导出app模块
module.exports = app;
