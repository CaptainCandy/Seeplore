// miniprogram/pages/mine/collectedPost.js
const app = getApp()
const utils = require('../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    collectedPost: null,
    collectedCollege: null,
    isMine: true,
    targetUserid: null,
    navTab: ["帖子", "院校"],
    currentNavtab: "0",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let targetUserid = app.globalData.userid
    this.setData({
      targetUserid
    })
    let that = this
    if (options.isMine !== 'true') {
      targetUserid = options.targetUserid
      this.setData({
        isMine: false,
        targetUserid: options.targetUserid
      })
      console.log(targetUserid)
    }
    wx.showLoading({
      title: '正在获取',
    })
    wx.cloud.callFunction({
      name: 'getActions',
      data: {
        collect: true, // 查看收藏列表 collect: true
        post: true, // 查看回复列表 reply: true
        userid: targetUserid // 所查看的目标用户的id ！！
      }
    }).then(
      res => {
        let lsPostid = res.result.actions.map(e => e.targetid);
        wx.cloud.callFunction({
          name: 'getPostList',
          data: {
            ids: lsPostid,
            userid: app.globalData.userid // 当前登录用户的ID
          }
        }).then(res => {
          console.log(that.data)
          console.log(res)
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
          }) // 帖子列表，不包含content ！！
          console.log(res.result.data)
          that.setData({
            collectedPost: res.result.data.reverse()
          })
          wx.hideLoading()
        });
      })
    wx.cloud.database().collection('institution-actions').where({
      userid: that.data.targetUserid// 目标用户userid！！
    }).get().then(
      res => {
        let lsName = res.data.map(e => e.target);
        let p = utils.getInstitutionList('rankusnews', app.globalData.userid, lsName); // 第二个参数用当前用户userID替代！！
        p.then(
          resp => { // 回调开始
            let lsInstitutions = resp.lsInstitutions
            console.log(lsInstitutions);
            lsInstitutions.map(college => {
              college.introduction = college.introduction.slice(0, 31) + '...'
            });
            that.setData({
              collectedCollege: lsInstitutions,
            })
          },// 回调结束
          err => { throw err }
        );
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

  switchTopTab: function (e) {
    this.setData({
      currentNavtab: e.currentTarget.dataset.idx
    });
  },

  onPostList: function (e) {
    wx.navigateTo({
      url: '../index/viewPost?curPostId=' + this.data.collectedPost[e.currentTarget.dataset.currentindex].postid,
    })
  },

  onCollege: function (e) {
    wx.navigateTo({
      url: '../collegeLib/college?name=' + e.currentTarget.dataset.name,
    })
  },

  onCollect: function (e) {
    const userid = app.globalData.userid;
    let index = e.currentTarget.dataset.index
    let collegeList = this.data.collectedCollege
    collegeList[index].collected = !collegeList[index].collected
    this.setData({
      collectedCollege: collegeList
    })
    if (collegeList[index].collected) {
      wx.showToast({
        title: '收藏成功！',
        duration: 2000
      })
    } else {
      wx.showToast({
        title: '取消成功！',
        duration: 2000
      })
    }
    utils.collectInstitution(collegeList[index].name, userid).then(
      result => {
        if (result.collected) {
          //由未收藏变为已收藏状态
          console.log('collect added')
        } else {
          //相反
          console.log('collect removed')
        }
      }, err => {
        console.log(err)
      }
      //缺少错误处理代码。
    )
  }
})