// miniprogram/pages/mine/userSite.js
const app = getApp()
const utils = require('../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null, //使用者
    siteUser: null, //看的页面属于哪个用户
    isMine: false,
    isFollow: false, //当前用户是否已经关注该页面用户
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
      utils.checkRelationshipWith(this.data.siteUser).then(res => {
        // res = {myFollowing: false, 当前用户未关注目标用户
        //        myFollower: false} 当前用户未被目标用户关注
        if (res.myFollowing) {
          that.setData({
            isFollow: true,
          })
        }
      });
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
  },

  onMyFollow: function () {
    wx.navigateTo({
      url: 'follower?isFollow=true&userid=' + this.data.siteUser,
    })
  },

  onMyFollower: function () {
    wx.navigateTo({
      url: 'follower?isFollow=false&userid=' + this.data.siteUser,
    })
  },

  onFollow: function () {
    let that = this
    let isFollow = this.data.isFollow
    if (isFollow) {
      wx.showLoading({
        title: '正在取消',
      })
      utils.unfollowTargetUser(this.data.siteUser).then(res => {
        // res.ok == true; 取消成功时
        // res.notFollowing == true; 本来就没关注
        if (res.ok) {
          wx.hideLoading()
          wx.showToast({
            title: '取消成功！',
          })
          that.setData({
            isFollow: false
          })
        }
        else {
          wx.hideLoading()
          if (res.notFollowing) {
            wx.showToast({
              title: '您本来就没有关注这个用户，请稍后尝试重新进入页面！',
              icon: "none",
              duration: 2000
            })
          }
          else{
            wx.showToast({
              title: '取关失败，请稍后再试！',
              icon: "none",
              duration: 2000
            })
          }
        }
      });
    }
    else {
      wx.showLoading({
        title: '正在关注',
      })
      //添加关注
      utils.followTargetUser(this.data.siteUser).then(res => {
        // res.ok == true; 关注成功时
        // res.alreadyFollowing == true; 关注失败时
        if (res.ok) {
          wx.hideLoading()
          wx.showToast({
            title: '关注成功！',
          })
          that.setData({
            isFollow: true
          })
        }
        else {
          wx.hideLoading()
          if (res.alreadyFollowing) {
            wx.showToast({
              title: '您已经关注了这个用户，请稍后重新进入页面！',
              icon: "none",
              duration: 2000
            })
          }
          else {
            wx.showToast({
              title: '关注失败，请稍后再试！',
              icon: "none",
              duration: 2000
            })
          }
        }
      });// 写入数据库失败直接抛出错误。
    }
  }
})