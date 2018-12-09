Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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

  onClickMe:function(e){
    console.log(e)
    const db = wx.cloud.database()
    /*db.collection('posts').doc('XAjVionnuWjciuDi').get(
      {
        success:function(res){
          console.log(res)
        },
        fail:function(res){
          console.log('error!')
        }
      }
    )*/
    db.collection('posts').get().then(res=>{
      console.log(res.data)
    }).catch(()=>{console.log('Error!!')})
  },
  onTapMe:function(e){
    const db = wx.cloud.database()
    db.collection('posts').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        description: "learn cloud database",
        due: new Date("2018-09-01"),
        tags: [
          "cloud",
          "database"
        ],
        location: new db.Geo.Point(113, 23),
        done: false
      }
    })
  }
})