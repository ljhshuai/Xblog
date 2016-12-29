# Xblog
node入门博客实例增强功能

一个完善中的博客站点 

后端node+express 

前端bootstrap jquery 

数据库mongodb 

功能描述：

<<<<<<< HEAD
注册、登录、发表文章、评论、点赞、首页浏览文章、用户上传头像、支持markdown编辑
=======
注册邮箱验证、登录、发表文章、评论、点赞、首页浏览文章、用户上传头像、支持markdown编辑
>>>>>>> 274db53e5302ffcffde4952de526dd179a71f97a

上述功能还有一些没有实现,后续会增加进来

使用：

进入程序根目录

<<<<<<< HEAD
=======
在根目录新建setting.js

输入如下内容：
```js
module.exports = {
	cookieSecret: "自己设置的cookie密钥",
	qqmail: {
		user: "你的qq邮箱",
		password: "qq邮箱smtp服务密码不是登录密码"
	}
};
```
保存后退出执行如下命令

>>>>>>> 274db53e5302ffcffde4952de526dd179a71f97a
npm install

npm start app.js

访问localhost:2000即可
<<<<<<< HEAD
=======
其中端口可以在/bin/www文件中更改
>>>>>>> 274db53e5302ffcffde4952de526dd179a71f97a
