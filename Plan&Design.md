# Seeplore-miniprogram Project

## Tasks

### post control

- [x] `Cloud Function` create post
  - 将编辑器保存的数据，转换格式，提交到数据库。
- [x] `CF` get single post in detail by post id
  - [x] check 是否点过赞
- [x] `CF` touch single post: including like, collect, follow
  - 参数传递
    - 操作名称： like,follow,collect
    - 操作状态： 新增，撤销
- `comparison` 点赞单独存储/作为用户与帖子的数字型字段
  - 单独存储
    - 查看某用户的点赞记录：拉取与当前_openid相匹配的“点赞”记录（post id）；调用getPostList(id列表) operation array => arr.map(ret postid) ~~// 使用field指定所返回的字段~~ => post array
    - 查看某个帖子的点赞数：where.count
    - 检查当前用户是否点过赞：where.where.count
    - 新的点赞：增加一条记录。取消点赞：删除一条记录。匹配 postid openid
  - 从属字段
    - 查看某个帖子的点赞数：array.length
    - 查看某用户的点赞记录：postid array=>post array
    - 检查当前用户是否点过赞：openid in array
    - 取消点赞：从帖子与用户分别获取数组；从数组删除某一项元素（使用filter）；用新数组update原有数组的相应字段 `terrible trouble`
- [x] `discuss` 将用户-内容的操作，包括点赞/收藏，分别在用户和帖子的数据集保存一条array类型的字段。相较于“单独的数据表存储点赞记录”，产生额外数据冗余；但获取用户的收藏列表会更快捷。
  - An alternative solution:  建立单独的operation control的云函数，用于维护 operation collection；用户查看某一个帖子，程序检查该用户是否为这个帖子点过赞时，从operation collection当中查找。post collection 仅保存点赞数
  - `agree` 分别在帖子和用户两处存储operation
- [x] `discuss` post JSON数据格式
  - 依赖于编辑器产生的数据格式 @CaptainCandy
  - 依赖于前端渲染template可以使用的内容格式
- [x] post 是否保存作者头像fileID? 如果每次查看帖子都需要根据openid从数据库查找昵称头像，返回列表后会比较复杂。
  - 保存时从user collection读取昵称、头像、_id。*读取方式与头像的保存方式解耦*
  - 但若仅在发帖时保存昵称、头像至post集合，它们将无法自动随用户更改头像而变化。
- [x] 展示帖子列表时：传给bindtap回调的event参数需要包含 post-id
- [x] `issue` post content: 图片保存
  - 现有editor是将图片上传到服务器，返回URL
  - wx.cloud.uploadFile则是返回fileID
  - rich-text组件应当可以处理fileID [文档：组件支持](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-client-api/component/index.html) 退而求其次，也可以使用image组件

### User control

- 由于用户会更改头像和微信昵称，数据库保存的用户身份可能失效；因此，每次用户打开小程序时与后端数据库同步一次UserInfo；Post control需要显示发帖人昵称和头像时，从数据库User Collection调取。
- [x] `Cloud Function` updateUserInfo() ~~createUserInfo()~~
  - [x] create user info 在云函数获取userInfo
  - `Trap!` 云端调用云函数，云函数无法通过context获取openid。
- ~~[ ] onLaunch: 判断是否拥有授权userInfo；若无，则展示“登录”按钮。~~ 每次都需要更新userInfo；不必区别授权
  - ~~点击登录后，调用`CF login`：授权和bindtap孰先孰后？~~
  - wx.authorize()不适用userInfo [必须通过button获取userInfo](https://developers.weixin.qq.com/community/develop/doc/0000a26e1aca6012e896a517556c01)
- 需要获取用户头像的情景
  - 用户查看本人信息：“我的” —— wxml:opendata直接获取
  - 用户查看他人信息 —— getUserInfo 获取头像URL/fielid 同时需要introduction
  - 用户查看各种帖子 —— 只需要头像和昵称，根据userID获取
- [x] `latest` 登录流程
  - [x] 建立前端登录按钮 button:getUserInfo
  - [x] 在按钮的响应事件里调用login云函数，传入userInfo
    - 默认参数userInfo只含openid；自定义参数myUserInfo包含详细信息
  - [x] login云函数根据openid判断是否新用户，选择调用create/update
    - create可以直接写进login; 而update函数在用户手动更新个人信息时也会被调用
  - [x] 保存到globalData: openid, userid, wxUserInfo

### tag control

- 数据结构
  - tag: name, category; id, name
    - 如何处理同义跳转? 比如，UCB和伯克利是同义词，id应该只有一个...不处理了吧，哪有那么多运管... 键入标签时，
    - post-tags: 每个帖子可以有多个标签，标签只能由发布者和管理员添加//标签可以由所有人维护
    - user-tags: 每位用户各自关注的标签。
- 用例图
  - 浏览者：搜索特定tag的帖子。发现所关心的标签的帖子（最新）
  - 创作者：发帖时选择tag。
    - 选择tag时根据当前输入，自动pop out
  - 管理者：合并、标记tag。
    - tag有分类，比如：地理位置、目标院校、标化考试
    - 特殊标签：院校标签可以跟院校库绑定；活动贴都需要入口
- 功能
  - doPostTags 增删post的标签
    - 输入：postid, tagname, remove
    - 输出：added, removed, unmatched, primary
  - doUserTags 增删user的标签
    - 输入：postid, tagname, remove
    - 输出：added, removed, unmatched, primary
  - manageTagsInfo 管理标签的分类
    - 输入：tagname, setcategory, setprimary

### Activity control

- 设计
  - 报名界面有多个入口？好像只有查看活动贴详情才有。
  - post增加一个可选字段：“活动报名链接？”
  - 如何避免重复报名：显示是否报名字段。如何查询已报名活动。根据userid唯一匹配报名。
  - 活动报名表字段
    - 管理员设置：数组（每个对象包括字段名和字段验证方式）
    - 报名时：数组（每个元素包括字段名和内容）

## Protocol

### Data Format

- posts 用于前端最新/最热/搜索结果的post列表
  - `列表如何显示正文？不显示/摘要/全文`

```js
  {//JSON 用于后台保存
    _id:,
    _openid:,
    title: String,
    abstract: String,
    content: [{
      img: true,
      fileid: "{fileid}"
    },{
      img: false,
      text: "这是文本"
    }],
    tags: String,//? 仅保存至tag collection;; String可用db.RegExp
    authorID: String, //_id in 'user' collection
    createTime: Date,
    heartCount: Number,
    status: Number// -1 草稿 1 发布 0 隐藏
  }

  {//保存事件 action
    _openid:,
    targetid:,//postid or reply id
    target:Number,// 1 Post 2 Reply
    userid:,//?
    action:Number,// 1 点赞 2 收藏 -1 举报
    createTime: Date
  }

  {//保存事件 post-action
    _openid:,
    targetid:,//postid
    userid:,//?
    action:Number,// 1 点赞 2 收藏 -1 举报
    createTime: Date  
  }

  [//JSON Array 用于传给前端渲染列表
    {
      _id:,  _openid,
      title: String,
      abstract: String,//仅用于list
      content: Array,//仅用于detail
      //viewCount: Number,
      heartCount: Number,
      isHearted: Boolean,
      isMine: Boolean,
      author: {
        nickname: String, avatar: fileID/URL
      },//作者的userinfo
      createTime: Date
    },
    {...},
    ...
  ]
```

- user

```js
{
  _openid: String,
  wxUserInfo: Object,//包含Avatar,nickname,gender..
  createTime: Date,
  email: String,
  phone: String,
  role: {isAgent:, isActivityManager:, isAccoundManager:, isSuperUser: },
  introduction: String,
  tagsPreferred: String,
  background: {undergraduate:String, graduate:,
    GPA:,TOEFL:,...},
  collection: Array,
}
```

- reply

```js
{//后台存储。
  _id:,postid:,
  parentid:,//if reply: 0, if comment: !0
  text:String,
  heartCount:0,
  authorid:,createTime:,status:
}
{//保存事件 reply-action
  _openid:,
  postid:,
  targetid:,//postid
  userid:,//?
  action:Number,// 1 点赞 2 收藏 -1 举报
  createTime: Date
}

[//JSON Array 某篇帖子对应的回帖列表 用于传给前端渲染列表
  {//? avatarUrl isMine
    replier: {
      nickname: String,
      avatarUrl: fileID
    },//回帖者的userinfo
    content: String,
    heartCount: Number,
    isHearted: Boolean,
    isMine: Boolean,
    comments: [
      {
        commenter: {
          nickname: String,
        },//回复者的userinfo
        content: String
      },
      {...},
      ...
    ]
  },
  {...},
  ...
]
```

### 前端操作数据库

```js
wx.cloud.database().collection('posts').add({
  data:{
    title: e.detail.title,
    abstract: e.detail.abstract,
    content: e.detail.content,
    tags: "",//? 仅保存至tag collection;; String可用db.RegExp
    authorID: app.globalData.userid, //_id in 'user' collection
    createTime: new Date(),
    heartCount: 0,
    status: 1 // -1 草稿 1 发布 0 隐藏
  }
}).then(function(resp){
  console.log(resp.result);//TODO 此时应当跳转发帖结束页面。
},function(err){
  console.log(err)
});
```

```js
//删除Post
wx.cloud.database().collection('posts').doc('post-id').update({
  data:{status:0}
}).then(
  function(resp){
    console.log(resp.stats.updated === 1); //说明删除成功
  },
  function(err){
    //错误处理。
  }
)

//删除reply
wx.cloud.database().collection('replies').doc('reply-id').update({
  data:{status:0}
}).then(
  function(resp){
    console.log(resp.stats.updated === 1); //说明删除成功
  },
  function(err){
    //错误处理。
  }
)

//新增reply
wx.cloud.database().collection('replies').add({data:{
  authorid: userid,
  postid:,
  text:,//content
  heartCount:0,
  parentid:,//若是comment，填入回复对象的reply id；否则，null。
  createTime:new Date(),
  status:1 // 0 隐藏
}}).then(
  function(resp){
    resp.result._id; //新增回复或回帖的reply ID
  },
  function(err){
    //错误处理。
  }
)

//撤销点赞帖子。
wx.cloud.callFunction({
  name:'doPostAction',
  data:{
    heart:true,
    undo:true,
    postid:,
    userid:
  }
}).then(
  function(resp){console.log(resp.result)},//result 三个属性中只有一个true；unmatched表示“撤销不存在的赞”或者“收藏已收藏的帖子”。
  /*result = {
      added:true,      removed: true,      unmatched: true
    }*/
  function(err){}//错误需要处理：可能是“撤销不存在的赞”或者“收藏已收藏的帖子”。;;
)

//获取回复
wx.cloud.callFunction({
  name:'getReplies',
  data:{
    postid: '',
    userid: '当前用户'
  }
}).then(resp=>{console.log(resp.result.data)})//返回的是reply的array

//新增或删除某个post的标签
var promise = wx.cloud.callFunction({name:'doPostTag',data:{postid:'test',tagname:'测试',remove:true}})
promise.then(resp=>console.log(resp.result))//result = {removed: true, added: undefined, unmatched: undefined}

//新增或删除某个user的标签
var promise = wx.cloud.callFunction({name:'doUserTag',data:{postid:'test',tagname:'测试',remove:true}})
promise.then(resp=>console.log(resp.result))//result = {removed: true, added: undefined, unmatched: undefined}
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
- `数据库操作`
  - command.set: 对于某一字段(类型Object)调用update时，若传入dict:key-value，默认只更新该字段的Object当中dict:key所对应的成员value。使用command.set时会整体更新。
    - collection.doc 未能取到对应记录也不会报错。
  - 只有小程序端创建的记录自动带有_openid字段
- `云控制台` ~~日志仅显示console.log() 不显示console.error()~~ 都显示的
  - 云函数在控制台上具备“测试”功能。
- `云函数` 从云端调用云函数，context是什么？
  - 上传云函数前需要保存。
  - Fucking HELL!!! 为什么云函数里面调用云函数只有await关键字的做法可以work，then()链式调用就不行！
  - `this` 云端应该是严格模式作为函数调用, this = { main: [Function] }.
  - [context & wx.getContext()](log.txt)
- `版本问题` 云函数login一直在报错，提示Unexpected identifier，发现是await关键字无法识别。
  - Fucking 云后台 JS版本到底是不是ES6
- `Promise` [没那么简单！](https://segmentfault.com/a/1190000010345031)
  - 返回then语句块当中修改过的变量一直失败！因为！！！搞了一晚上！发现！then之外的语句先于then之内的语句执行。
    - 讲道理应该把return语句放在then里面，但这样云函数直接把null返回给客户端了
    - await关键字应该可以中断这个异步函数，让它...合着我之前的云函数一直是同步函数我FFFFFFFF 应该搜索“await unexpected identifier”的。
    - Promise then 和 async await 机制层面就不一样呀。

## JavaScript Basics

### function & object

- function里面的this指向谁？取决于如何调用此function
  - 使用new关键字，作为构造函数调用：指向所构造的新对象
  - 简单直接调用，非严格模式：指向全局对象；严格模式：undefined
- [object的定义与引用方法](http://es6.ruanyifeng.com/#docs/object)

### vairable scope

- var / let 定义变量的作用范围
  - ?: 上文定义过变量recordID时，后文回调函数的形式参数同样命名为recordID "then(recordID=>{...})" 是否会引起冲突：{...}内部的recordID错误地引用至全局变量？

## Browser Tasks

### Finished

- overall
  - customized tabbar
  - 美化G宁的登录界面
  - seeplore放中间 //无法实现，微信不提供这样的功能，要实现的话顶部导航栏全部要自己重写
  - acquire user authorization popup //用G宁的方法实现
- index
  - pre-post list templete: dataformat, style
  - viewPost页面布局已完成
- category
- post
  - richtext editor
- college
- mine

### Unsolved

- overall

- index
  - post查看页面逻辑, heart\reply etc. button
- category
  - 类目-标签的 templete
- post
  - 弹窗或跳转页面提示选择帖子种类
- college
  - pre-college list templete: dataformat, collect button
- mine
  - selfinfo templete
  - my draft page
  - my collection page
  - agent certification application page
  - settings