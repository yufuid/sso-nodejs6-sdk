玉符SDK v1.0 - 服务提供者（SP)
======

玉符SDK集成了签署和验证JWT令牌的功能，使得服务提供者（SP）只需要用很少的代码就可以轻松将玉符提供的单点登录集成到现有的服务之中。

---
## 使用SDK之前
* 作为服务提供者（SP），可以使用玉符SDK验证JWT令牌的有效性（包括有效期、签名等），成功后进行相应的鉴权。
* 如果服务提供者（SP）还为用户/租户提供身份联合、第三方登录的功能，可以使用玉符SDK生成并签署JWT令牌，并送到玉符服务器上认证并跳转到第三方身份提供者。(需额外生成pem格式的公私钥文件)
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
    var serviceProvider = yufusdk.init({
        type: 'sp',
        expiresIn: 300,                                  // 令牌有效期限（单位：秒, 默认为5分钟）
    });
```

2. 实现单点登录：接收并验证JWT令牌的有效性（包括有效期、签名等），如通过，说明该令牌来自玉符信任的有效租户(企业/组织)的用户，样例
```
    app.get('/sso', function (req, res) {                  // 假设单点登录端点为'/sso'
        var id_token = req.params.id_token;                // 从URL中获得 ID token
        var result;
        try {
            result = serviceProvider.verify(id_token);     // 使用验证玉符SDK实例进行验证, 如果成功会返回包含用户信息的对象，失败则会产生授权错误的异常
        } catch (ex) {
            console.error(ex);
        }
        // ...
    });
    /* 使用回调方式
     * serviceProvider.verify(id_token, (error, result) => {
     *   if (!error) {                                    // 验证成功
     *   }
     * });
     */
```
  > 配置完成后，单点登录端点就可以验证玉符发放的id_token令牌，例如：
  https://someservice.domain.com/sso?id_token=eyJraWQiOiJDSURQX0tFWUlEIiwiYWxnIjoiUlMyNTYifQ.eyJhdWQiOiJzcC14eHh4eHh4eC14eHh4LXh4eHgteHh4eC14eHh4eHh4eHh4eHgiLCJzY29wZSI6Im9wZW5pZCIsImlzcyI6Imlzc3VlciIsInRudCI6Ill1ZnUiLCJzdGF0ZSI6InNvbWUgc3RhdGUgdmFsdWUiLCJleHAiOjE0NzgyNTc5OTIsImlhdCI6MTQ3ODI1NzY5Miwic3BpZCI6InNwLXh4eHh4eHh4LXh4eHgteHh4eC14eHh4LXh4eHh4eHh4eHh4eCIsInNwIjoi546J56ymIn0.Lq8c2O9m4FY8z7C9A3FB1LyK5q3QBrRLwyXlOgVzxP2AvesYh4K8dN6Pe8d3zulvNdcLFEw7JE7fe80ItZ3Jm3lf3_8XFiJEw3fqRrrQyJJSHQi0SjwVrKm13G1czB2zo5PRTskNfIqIWXrUc0l6T2OxXY_1R9cfFO0VHKWxu0zY3mKjtdf8AhugJePhbB4i9C4lACtypbR2hOFYx_7zB-E9Z47BMNY1n4Rszq-ZM9_4BCZPum3tMnXRAms8k57WbGrOLI3O-lRi76qFzUIQuIy38D6qh7feRtCt36yRhVOlxDCZ4_zDnu9p68DOw9LgkQliQmuPCg1PHszr57E-

3. 根据第2步获取的用户信息，您的系统可进行鉴权和赋予登录系统等相应权限，否则提示用户登录失败。推荐鉴权方案:
  * 服务提供商(SP)允许租户管理员输入一个玉符的唯一识别码
  * 在第2步Token验证通过后，根据获取的租户名称/ID和识别码, 查看是否匹配该租户在服务提供商(SP)所提供的唯一识别码，如匹配则表示租户为有效租户。
  * 接着查看用户是否存在于租户中，如果存在，则赋予登录系统的权限。
```
    //  ...续上
    if (result) {
        var user = result.sub;                         // 获得用户名和租户对应信息
        var tenant = result.tnt;
        var client_id = result.aud;
        if (client_id === getUniqueId(tenant) && isUserInTenant(user, tenant)) {
          // 赋予登录系统的权限，如重定向到home页面。
        }
    }
```

4. *(可选)* 如果想为用户/租户提供身份联合、第三方登录的功能，需在初始化的时候添加私钥路径，并提供公钥给租户管理员在玉符管理系统输入。
```
    var serviceProvider = yufusdk.init({
        type: 'sp',
        expiresIn: 300,                                  // 令牌有效期限（单位：秒, 默认为5分钟）
        myPrivateKey: {                                     // 身份提供者的私钥文件
            path: '{PATH/TO/KEY}',
        },
    });
```
初始化后，如果用户在服务提供商界面想用玉符登录的话，可以为用户生成带有签署令牌的链接，并向用户发送302跳转登录到玉符或其他身份提供商
```
  app.post('/sso/login', function (req, res) {
      var username, tenant = getCurrentUserAndTenant();   // 用户名和租户（根据需求，可以对用户进行验证）
      var params = {
          subject: username,
          issuer: 'sp-xxxx-xxxx-xxxx-xxxx',               // 如果采用了第3步的鉴权方案，这里需使用管理员输入的唯一识别码
          tnt: tenant,
          state: 'state'                                  // 状态（如无可用`\_`代替）
      };

      var redirectUrl = serviceProvider.generateRedirectUrl(params);
      res.redirect(redirectUrl);                          // 生成认证链接并进行跳转
  });
```

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
