// pages/collegeLib/collegeLib.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabbar:{},
    countryPicker: ['全部', '美国', '英国', '香港'],
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
    this.fetchCollegeList(this.data.rankIndex)
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
    that.fetchCollegeList(rank)
    setTimeout(function(){
      if (country !== '全部') {
        let collegeList = that.data.collegeList
        let collegeListAfter = collegeList.filter(function (college) {
          return college.country === country
        })
        console.log(collegeListAfter)
        that.setData({
          collegeList: collegeListAfter
        })
      }
      console.log(that.data)
      wx.hideLoading()
    }, 1000)
  },

  fetchCollegeList: function(rankIndex) {
    //读取院校数据
    const db = wx.cloud.database();
    let that = this;
    let rankType = ['rankusnews', "ranktimes", "rankqs"]
    let rankingType = rankType[rankIndex]; // "ranktimes" "rankqs" 'rankusnews'
    db.collection('institutions').orderBy(rankingType, 'asc').get().then(
      resp => {
        let lsInstitutions = resp.data.map(
          elem => {
            return {
              ranking: elem[rankingType],
              name: elem.name, engname: elem.engname,
              country: elem.country, location: elem.location,
              introduction: elem.introduction, website: elem.website
            }
          }
        );
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

  onCollege: function(e) {
    wx.navigateTo({
      url: 'college?name=' + e.currentTarget.dataset.name,
    })
  }
})