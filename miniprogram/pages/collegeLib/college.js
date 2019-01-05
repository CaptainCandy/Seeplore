// miniprogram/pages/collegeLib/college.js
const utils = require('../../utils/utils.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentCollege: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //读取院校数据
    const db = wx.cloud.database();
    let that = this;
    console.log(options)
    db.collection('institutions').where({name:options.name}).get().then(
      resp => {
        let institution = resp.data;
        console.log(institution);
        that.setData({
          currentCollege: institution[0],
        })
      },
      err => { throw err }
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
  onShareAppMessage: function (e) {
    if (e.from === 'button') {
      // 来自页面内转发按钮
      console.log(e.target)
    }
    return {
      title: this.data.currentCollege.name,
      path: '/pages/index/index?name=' + this.data.currentCollege.name + '&isCollegeShare=' + true,
      success: function (res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
        wx.showToast({
          title: '转发成功！',
          duration: 2000,
        })
        var shareTickets = res.shareTickets;
        // if (shareTickets.length == 0) {
        //   return false;
        // }
        // //可以获取群组信息
        // wx.getShareInfo({
        //   shareTicket: shareTickets[0],
        //   success: function (res) {
        //     console.log(res)
        //   }
        // })
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
        wx.showToast({
          title: '转发失败！\n请检查网络后重新尝试',
          icon: 'none',
          duration: 2000,
        })
      }
    }
  },

  onCollect: function(e) {

  }
})