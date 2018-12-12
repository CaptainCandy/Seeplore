# project

## tasks

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
- [ ] `discuss` 将用户-内容的操作，包括点赞/收藏，分别在用户和帖子的数据集保存一条array类型的字段。
  - 相较于“单独的数据表存储点赞记录”，产生额外数据冗余；但获取用户的收藏列表会更快捷。
  - An alternative solution:
    - 建立单独的operation control的云函数，用于维护 operation collection
    - 用户查看某一个帖子，程序检查该用户是否为这个帖子点过赞时，从operation collection当中查找。
    - post collection 仅保存点赞数
- [ ] `discuss` post JSON数据格式
  - 依赖于编辑器产生的数据格式 @CaptainCandy
    array套JSON
  ```
    [
      {
        title: "",
        content: "",
        viewCount: ,
        heartCount: ,
        whetherHeart: ,
        userInfo: {},
        createTime: ,
      },
      {},
      {}
    ]
  ```
  - 依赖于前端渲染template可以使用的内容格式
