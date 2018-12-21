// miniprogram/pages/reply/reply.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    curReply: null,
    replyBuffer: "",
    curPostId: "",
    curPostTitle: "",
    curPostAuthor: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //先把特殊字符转义回来
    let postid = unescape(options.curPostId)
    let title = unescape(options.curPostTitle)
    let author = unescape(options.curPostAuthor)
    this.setData({
      curPostId: postid,
      curPostTitle: title,
      curPostAuthor: author,
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
  onReplyInput: function (e) {
    let replyBuffer = this.data.replyBuffer;
    replyBuffer = e.detail.value;
    this.setData({
      replyBuffer,
    })
  },

  /**
    * 事件：发表按钮点击
    */
  onReply: function (e) {
    console.log(this.data.replyBuffer);
    let that = this
    wx.cloud.database().collection('replies').add({
      data:{
        authorid: app.globalData.userid,
        postid: this.data.curPostId,
        text: this.data.replyBuffer,//content
        heartCount: 0,
        parentid: null,//若是comment，填入回复对象的reply id；否则，null。
        createTime: new Date(),
        status: 1
      }
    }).then(
      function (resp) {
        console.log(resp._id); //新增回复或回帖的reply ID
        /*wx.navigateBack({
          delta: 1,
        })*/
        wx.navigateTo({
          url: '../index/viewPost?curPostId=' + that.data.curPostId,
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