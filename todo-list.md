# Project

## Tasks

### post control

- [ ] `Cloud Function` create post
  - 将编辑器保存的数据，转换格式，提交到数据库。
    - 不是submit，而是getContent?
- [ ] `CF` get single post in detail by post id
  - [ ] retrive metadata from cloud db
  - [ ] get replies and comment
  - [ ] update popularity
  - [ ] check 是否点过赞
    - 客户端存储临时数据：该用户是否曾经在当前post进行过 like，collect 等操作。
- [ ] `CF` touch single post: including like, collect, follow
  - 参数传递
    - 操作名称： like,follow,collect
    - 操作状态： 新增，撤销
  - [ ] 在该post的对应字段的数组添加用户的post id
- [x] `discuss` 将用户-内容的操作，包括点赞/收藏，分别在用户和帖子的数据集保存一条array类型的字段。
  - 相较于“单独的数据表存储点赞记录”，产生额外数据冗余；但获取用户的收藏列表会更快捷。
  - An alternative solution:
    - 建立单独的operation control的云函数，用于维护 operation collection
    - 用户查看某一个帖子，程序检查该用户是否为这个帖子点过赞时，从operation collection当中查找。
    - post collection 仅保存点赞数
  - `agree` 分别在帖子和用户两处存储operation
- [x] `discuss` post JSON数据格式
  - 依赖于编辑器产生的数据格式 @CaptainCandy
  - 依赖于前端渲染template可以使用的内容格式
- [ ] 展示帖子列表时：传给bindtap回调的event参数需要包含 post-id
- [ ] `issue` post content: 图片保存
  - 现有editor是将图片上传到服务器，返回URL
  - wx.cloud.uploadFile则是返回fileID
  
## Protocol

### Data Format

- posts 用于前端最新/最热/搜索结果的post列表
  - `列表如何显示正文？不显示/摘要/全文`

```js
  [//JSON Array
    {
      title: String,
      content: String,
      viewCount: Number,
      heartCount: Number,
      whetherHearted: true/false,
      userInfo: Object,//作者的userinfo
      createTime: Datetime
    },
    {...},
    ...
  ]
```

- user

```js
  {
    openid: true/false,
    userInfo: Object,//作者的userinfo
    createTime: Datetime
  }
```

## Doubt & Know

- `身份` 登录用户信息
  - 如何获取openid? 调用云函数的event包括openid
  - 是否需要调用 wx.login? 这个函数的作用是什么？
  - UserInfo 这是app.js - global data的一项。
  - getUserInfo() [document](https://developers.weixin.qq.com/miniprogram/dev/api/wx.getUserInfo.html)
    - 需要用户授权？
    - UserInfo包括: 昵称 头像 ...
  - `know`
    - 调用这一函数，需要首先获取授权
    - 若用户更换头像，原有头像 URL 将失效
  - 登录机制 wx.login [官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html) ; [时序图](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/image/api-login.jpg) ; 似乎针对涉及开发者服务器的小程序
