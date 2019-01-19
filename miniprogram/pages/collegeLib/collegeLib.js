// pages/collegeLib/collegeLib.js
const app = getApp()
const utils = require('../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabbar:{},
    countryPicker: ['全部', '美国', '英国', '新加坡', '中国大陆'],
    rankPicker: ['U.S.News', 'QS', 'Times'],
    countryIndex: 0,
    rankIndex: 0,
    collegeList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.editTabbar()
    //读取院校数据
    let that = this;
    let rankType = ['rankusnews', "ranktimes", "rankqs"]
    let rankingType = rankType[this.data.rankIndex]; // "ranktimes" "rankqs" 'rankusnews'
    const userid = app.globalData.userid;
    let p = utils.getInstitutionList(rankingType, userid)
    p.then(
      resp => {
        let lsInstitutions = resp.lsInstitutions
        console.log(lsInstitutions);
        lsInstitutions.map(college => {
          college.introduction = college.introduction.slice(0, 31) + '...'
        })
        that.setData({
          collegeList: lsInstitutions,
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
    //读取院校数据
    let that = this;
    let rankType = ['rankusnews', "ranktimes", "rankqs"]
    let rankingType = rankType[this.data.rankIndex]; // "ranktimes" "rankqs" 'rankusnews'
    const userid = app.globalData.userid;
    let p = utils.getInstitutionList(rankingType, userid)
    p.then(
      resp => {
        let lsInstitutions = resp.lsInstitutions
        console.log(lsInstitutions);
        lsInstitutions.map(college => {
          college.introduction = college.introduction.slice(0, 31) + '...'
        })
        that.setData({
          collegeList: lsInstitutions,
        })
      },
      err => { throw err }
    );
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
    return {
      title: 'Seeplore院校库'
    }
  },

  countryChange: function(e) {
    this.setData({
      countryIndex: e.detail.value
    })
  },

  rankChange: function(e) {
    this.setData({
      rankIndex: e.detail.value
    })
  },

  filter: function(e) {
    wx.showLoading({
      title: '正在筛选',
    })
    let country = this.data.countryPicker[this.data.countryIndex]
    let rank = this.data.rankIndex
    let that = this
    let rankType = ['rankusnews', "ranktimes", "rankqs"]
    let rankingType = rankType[rank]; // "ranktimes" "rankqs" 'rankusnews'
    const userid = app.globalData.userid;
    let p = utils.getInstitutionList(rankingType, userid)
    p.then(resp => {
      let collegeList = resp.lsInstitutions
      if (country !== '全部') {
        let collegeListAfter = collegeList.filter(function (college) {
          return college.country === country
        })
        collegeListAfter.map(college => {
          college.introduction = college.introduction.slice(0, 31) + '...'
        })
        console.log(collegeListAfter)
        that.setData({
          collegeList: collegeListAfter
        })
      }
      wx.hideLoading()
    })
  },

  onCollege: function(e) {
    wx.navigateTo({
      url: 'college?name=' + e.currentTarget.dataset.name,
    })
  },

  onCollect: function(e) {
    const userid = app.globalData.userid;
    let index = e.currentTarget.dataset.index
    let collegeList = this.data.collegeList
    collegeList[index].collected = !collegeList[index].collected
    this.setData({
      collegeList
    })
    if (collegeList[index].collected) {
      wx.showToast({
        title: '收藏成功！',
        duration: 2000
      })
    }else {
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