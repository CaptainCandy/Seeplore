// miniprogram/pages/mine/follower.js
const app = getApp()
const utils = require('../../utils/utils')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isFollow: true, //取真表示该页面看到的是目标用户关注的人而不是TA的粉丝
    userid: '', //该页面所属的用户id，不是当前使用者id
    userlist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let isFollow = options.isFollow
    let userid = options.userid
    let that = this
    wx.showLoading({
      title: '正在加载',
    })
    if (isFollow === 'true') {
      utils.viewUsersFollowedBy(options.userid).then(res => {
        // res.data = [{user:{role,wxUserInfo,_id},
        // relationshipToCurUser:{'参见demo-16'}},...]
        console.log(res.data)
        that.setData({
          userlist: res.data.reverse()
        })
        wx.hideLoading()
      });
    }
    else if (isFollow === 'false') {
      utils.viewUsersFollowing(options.userid).then(res => {
        // res.data = [{user:{role,wxUserInfo,_id},
        // relationshipToCurUser:{'参见demo-16'}},...]
        console.log(res.data)
        that.setData({
          userlist: res.data.reverse()
        })
        wx.hideLoading()
      })
    }
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

  onUser: function (e) {
    wx.navigateTo({
      url: 'userSite?targetUserid=' + this.data.userlist[e.currentTarget.dataset.index].user._id,
    })
  },

  onFollow: function (e) {
    let that = this
    let userlist = this.data.userlist
    let index = e.currentTarget.dataset.index
    console.log(index)
    if (userlist[index].relationshipToCurUser.myFollowing) {
      wx.showLoading({
        title: '正在取消',
      })
      utils.unfollowTargetUser(userlist[index].user._id).then(res => {
        // res.ok == true; 取消成功时
        // res.notFollowing == true; 本来就没关注
        if (res.ok) {
          wx.hideLoading()
          wx.showToast({
            title: '取消成功！',
          })
          userlist[index].relationshipToCurUser.myFollowing = false
          that.setData({
            userlist
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
          else {
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
      utils.followTargetUser(userlist[index].user._id).then(res => {
        // res.ok == true; 关注成功时
        // res.alreadyFollowing == true; 关注失败时
        if (res.ok) {
          wx.hideLoading()
          wx.showToast({
            title: '关注成功！',
          })
          userlist[index].relationshipToCurUser.myFollowing = true
          that.setData({
            userlist
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