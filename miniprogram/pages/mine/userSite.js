// miniprogram/pages/mine/userSite.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null, //使用者
    siteUser: null, //看的页面属于哪个用户
    isMine: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    if (options.isMine === 'true') {
      this.setData({
        isMine: true,
        siteUser: app.globalData.userid
      })
    }else {
      this.setData({
        siteUser: options.targetUserid
      })
    }
    wx.cloud.callFunction({
      name: 'getUserInfo',
      data: {
        userid: that.data.siteUser,
        fields: {
          "wxUserInfo.nickName": true,
          "wxUserInfo.avatarUrl": true,
          contact: true, // object：字段有email/phone
          createDate: true, // 注册时间 Datetime字符串
          "introduction": true // 指定所需要的字段
        },
        stats: true // 客户端从 res.result.stats 获取统计结果。返回值里面的 stats：对象，字段包括post, heart, collect, follower, following，均为number。
      }
    }).then(res => {
      console.log(res)
      this.setData({
        userInfo: res.result
      })
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
    let that = this
    wx.cloud.callFunction({
      name: 'getUserInfo',
      data: {
        userid: that.data.siteUser,
        fields: {
          "wxUserInfo.nickName": true,
          "wxUserInfo.avatarUrl": true,
          contact: true, // object：字段有email/phone
          createDate: true, // 注册时间 Datetime字符串
          "introduction": true // 指定所需要的字段
        },
        stats: true // 客户端从 res.result.stats 获取统计结果。返回值里面的 stats：对象，字段包括post, heart, collect, follower, following，均为number。
      }
    }).then(res => {
      console.log(res)
      this.setData({
        userInfo: res.result
      })
    })
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

  onChangeInfo: function () {
    if (this.data.isMine === true) {
      wx.navigateTo({
        url: 'changeInfo?changeType=intro&userid=' + app.globalData.userid,
      })
    }
  },

  onCollection: function () {
    wx.navigateTo({
      url: 'collectedPost?isMine' + this.data.isMine + '&targetUserid=' + this.data.siteUser,
    })
  },

  onPost: function () {
    wx.navigateTo({
      url: 'myPost?isMine' + this.data.isMine + '&targetUserid=' + this.data.siteUser,
    })
  }
})