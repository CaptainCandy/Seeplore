// miniprogram/pages/reply/comment.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    curComment: null,
    commentBuffer: "",
    curPostId: "",
    _id: "", //指的是回复的对象的_id，可能是回帖也可能是回复，下面代码中要注意区分
    curReplyContent: "",
    curReplyAuthor: "",
    author_logic: "" //用来判断局部更新上一层的页面需不需要显示作者
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //先把特殊字符转义回来
    let postid = unescape(options.curPostId)
    let _id = unescape(options._id)
    let content = unescape(options.curReplyContent)
    let author = unescape(options.curReplyAuthor)
    let author_logic = author
    if (options.parentid === 'undefined') author_logic = ""
    this.setData({
      curPostId: postid,
      _id: _id,
      curReplyContent: content,
      curReplyAuthor: author,
      author_logic: author_logic
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
    * 事件：回帖内容输入
    */
  onCommentInput: function (e) {
    let commentBuffer = this.data.commentBuffer;
    commentBuffer = e.detail.value;
    this.setData({
      commentBuffer,
    })
  },

  /**
    * 事件：发表按钮点击
    */
  onComment: function (e) {
    console.log(this.data.commentBuffer);
    let that = this
    wx.cloud.database().collection('replies').add({
      data: {
        authorid: app.globalData.userid,
        postid: that.data.curPostId,
        text: that.data.commentBuffer,//content
        heartCount: 0,
        parentid: that.data._id, //若是comment，填入回复对象的reply id；否则，null。
        createTime: new Date(),
        status: 1
      }
    }).then(
      function (resp) {
        console.log(resp._id); //新增回复或回帖的reply ID
        let pages = getCurrentPages()
        let prePage = pages[pages.length - 2]
        let replyList = prePage.data.replyList
        let _id = that.data._id //回复的对象的_id
        let index = 0;
        for (var i = 0; i < replyList.length; i++) {
          if (replyList[i]._id == _id) {
            index = i;
            break;
          }
        }
        replyList[index].comments.push({
          _id: resp._id, //当前回复的_id
          replier: {
            nickName: app.globalData.userInfo.nickName,
            avatarUrl: app.globalData.userInfo.avatarUrl
          },
          content: that.data.commentBuffer,
          createTime: '刚刚',
          parentid: _id, //回复的对象的_id
          postid: that.data.curPostId,
          parentNickname: that.data.author_logic,
          status: 1,
          isMine: true,
        })
        console.log(replyList)
        prePage.setData({
          replyList: replyList
        })
        wx.navigateBack({
          delta: 1,
        })
      },
      function (err) {
        //错误处理。
        console.log(err)
        wx.showToast({
          title: '发表失败\n请检查网络后重试',
          icon: "none",
          duration: 2000
        })
      }
    )
  }
})