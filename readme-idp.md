玉符SDK v1.0 - 身份提供者（IDP）
======

玉符SDK集成了签署和验证JWT令牌的功能，使得身份提供者（IDP）只需要用很少的代码就可以轻松将玉符提供的单点登录和其他功能集成到现有的服务之中。

---
## 使用SDK之前
* 作为身份提供者（IDP），可以使用玉符SDK为用户生成并签署JWT令牌，并送到玉符服务器上认证并登录到第三方服务提供商。
  >需从玉符注册并获取相应的身份提供者ID，并生成pem格式的公私钥文件。
---
## 安装SDK

1. 添加JWT令牌标准的依赖库(如已安装，可跳过此步), 在项目根目录下运行:
```
  npm install jsonwebtoken@5.7.0 -S
```
  > 或者可以在项目`package.json`文件中的`dependencies`加入`"jsonwebtoken": "^5.7.0"`，然后在根目录下运行`npm install`安装。

2. 将`yufusdk`文件夹添加到项目中, 在代码中载入后调用
```
    var yufusdk = require('./yufusdk');
```

---
## 使用SDK
1. 初始化SDK
```
  var idProvider = yufusdk.init({
      type: 'idp',
      idpId: 'idp-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  // 从玉符获取的身份提供者ID
      expiresIn: 5 * 60,                                  // 令牌有效期限（单位：秒, 默认为5分钟）
      myPrivateKey: {                                     // 身份提供者的私钥文件
          path: '{PATH/TO/KEY}',
      },
  });
```
2. 根据用户选取的服务应用ID，可以为用户生成并签署对应令牌，并向用户发送302跳转登录到第三方服务提供商，代码样式
```
  app.post('/sso/service', function (req, res) {
      var username, tenant = getCurrentUserAndTenant();   // 用户名和租户（根据需求，可以对用户进行验证）
      var spId = res.params.spid;                         // 从玉符上所注册的第三方服务应用ID 例如 'sp-xxxx-xxxx-xxxx-xxxx'
      var params = {
          subject: username,
          spid: spId,
          tenant: tenant,
          state: 'state'                                  // 可被回传的状态值（如无可用`\_`代替)
      };
      var redirectUrl = idProvider.generateRedirectUrl(params);
      res.redirect(redirectUrl);                          // 生成认证链接并进行跳转
  });
```
  > 跳转链接会转到玉符服务器上认证，例如：
  https://idp.yufuid.com/v1/sso/authorize?idp_token=eyJraWQiOiJDSURQX0tFWUlEIiwiYWxnIjoiUlMyNTYifQ.eyJhdWQiOiJpZHAteHh4eHh4eHgteHh4eC14eHh4LXh4eHgteHh4eHh4eHh4eHh4Iiwic2NvcGUiOiJvcGVuaWQiLCJpc3MiOiJpc3N1ZXIiLCJ0bnQiOiJZdWZ1Iiwic3RhdGUiOiJzb21lIHN0YXRlIHZhbHVlIiwiZXhwIjoxNDc4MjU3OTkyLCJpYXQiOjE0NzgyNTc2OTIsInNwaWQiOiJzcC14eHh4eHh4eC14eHh4LXh4eHgteHh4eC14eHh4eHh4eHh4eHgiLCJzcCI6IueOieespiJ9.YB_0o_V2w9ZbXBNW_1xBoo2EWo4yyD7XP0_yADb3gxTDTyXqK0K56XYHn4Q5t5ryh9HOhImFrGUSaI8GsznookDtrwkSBKW1ybQxkQzJpfbNJXlphMTGlvg4oM820tjS1WJEdTEhMenYudBPMQkmn7AKuf2gzwVa-UhANtRzV0MlHLCVZGixAKzDG2LxsvMeV-ViPYiGUVZap3gtZxZx4DPhMrFBWw3ztNmF5eKSPOBNjU2xtxXhi9HEWGr3W-XaemuNoecWAEMuAFHuha7XZSopuFrIcI3nFb4U9QuMv_bN2KyuQFk5jOz9jfGxNK3OYLwAhxHa0j8jWyiN5i8mUQ

---
## Release Notes
** v1.0 **
 * 支持Nodejs常见的回调方式，减少潜在的阻塞问题。
 * 订阅式获取公钥，提高安全性
  Prefer use of callback to prevent potential blocking issue
  Support Yufu key rotation via public key service

---
## FAQ

---
## 联系玉符
contact@yufuid.com
