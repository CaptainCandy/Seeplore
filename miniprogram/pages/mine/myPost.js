// miniprogram/pages/mine/myPost.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myPost: null,
    isMine: true,
    postList: null,
    targetUserid: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      targetUserid: app.globalData.userid
    })
    let that = this
    if (options.isMine !== 'true') {
      this.setData({
        isMine: false,
        targetUserid: options.targetUserid
      })
    }
    wx.showLoading({
      title: '正在加载',
    })
    wx.cloud.callFunction({
      name: 'getPostList',
      data: {
        authorid: that.data.targetUserid, // 所查看的目标用户的id ！！
        userid: app.globalData.userid // 当前登录用户的ID !
      }
    }).then(res => {
      res.result.data.map(post => {
        //控制时间的展示样式，当天的帖子显示小时分钟，非当天的显示日期
        let now = new Date();
        let createTime = new Date(post.createTime);
        if (now.getFullYear() == createTime.getFullYear() && now.getDate() == createTime.getDate() && now.getMonth() == createTime.getMonth()) {
          let strTime = null;
          if (createTime.getMinutes() <= 9 && createTime.getMinutes() >= 0) strTime = createTime.getHours() + ':0' + createTime.getMinutes();
          else strTime = createTime.getHours() + ':' + createTime.getMinutes();
          createTime = strTime;
        }
        else {
          let strTime = (createTime.getMonth() + 1) + '-' + createTime.getDate();
          createTime = strTime;
        }
        post.createTime = createTime;
      }) // 帖子列表，不包含content
      console.log(res.result.data)
      that.setData({
        postList: res.result.data.reverse()
      })
      wx.hideLoading()
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

  }
})