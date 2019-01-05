// miniprogram/pages/mine/myApply.js
const app = getApp()
const utils = require('../../utils/utils')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    applyList: null,
    isApplied: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    utils.getMyApplication().then(
      res => {
        if (res.isSubmitted) {
          res.data.map(apply => {
            //控制时间的展示样式，当天的帖子显示小时分钟，非当天的显示日期
            let now = new Date();
            let createTime = new Date(apply.createTime);
            if (now.getFullYear() == createTime.getFullYear() && now.getDate() == createTime.getDate() && now.getMonth() == createTime.getMonth()) {
              let strTime = null;
              if (createTime.getMinutes() <= 9 && createTime.getMinutes() >= 0) strTime = createTime.getHours() + ':0' + createTime.getMinutes();
              else strTime = createTime.getHours() + ':' + createTime.getMinutes();
              createTime = strTime;
            }
            else {
              let strTime = createTime.getFullYear() + '-' + (createTime.getMonth() + 1) + '-' + createTime.getDate();
              createTime = strTime;
            }
            apply.createTime = createTime;
          })
          that.setData({
            applyList: res.data.reverse()
          })// 用户申请表的数据，状态字段包括：isChecked, isApproved, message(管理员check时附上的消息)
          console.log(res.data)
        } else {
          //TODO 用户未曾提交过申请
          that.setData({
            isApplied: false
          })
        }
      }
    );
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

  
})