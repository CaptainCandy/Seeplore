// miniprogram/pages/index/myPost.js
const utils = require('../../utils/utils.js');
const app = getApp();

//使用严格模式，为了使用let
"use strict";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPost: null,
    postImageList: [], //fileid
    replyList: [],
    currentPage: 1,
    pageCount: 1,
    isPullUp: false,
    loading: false, //"上拉加载"的变量，默认false，隐藏  
    loaded: false, //"已经没有数据"的变量，默认false，隐藏 
    isFirstLoading: true,  //第一次加载，设置true ,进入该界面时就开始加载
    userInfo: {},
  },  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //接受帖子信息
    wx.showLoading({
      title: '正在获取...',
    })
    let curPostId = options.curPostId
    let currentPost = null;
    let imageList = []
    wx.cloud.callFunction({
      name: 'getPostDetail',
      data: {
        postid: curPostId,
      },
    }).then(res => {
      console.log(res);
      currentPost = res.result;
      //控制时间的展示样式，当天的帖子显示小时分钟，非当天的显示日期
      let now = new Date();
      let createTime = new Date(currentPost.createTime);
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
      currentPost.createTime = createTime;
      //预设好图片列表以供放大预览
      for (var n = 0; n < currentPost.content.length; n++) {
        if (currentPost.content[n].img == true) imageList.push(currentPost.content[n].fileid)
      }
      
      this.setData({
        currentPost: currentPost,
        postImageList: imageList,
      })
      wx.hideLoading()
    })

    //获取用户信息
    this.setData({
      userInfo: app.globalData.userInfo,
    })
    
    wx.showShareMenu({
      // 要求小程序返回分享目标信息
      withShareTicket: true
    }); 
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
    let that = this;

    wx.showLoading({
      title: '加载中',
    })
    that.setData({
      isPullUp: true,
      isFirstLoading: false, // 上拉触发后，不再是初始数据加载，按页码加载
      loading: true //把"上拉加载"的变量设为false，显示 
    });
    //获取帖子
    new Promise(function (resolve, reject) {
      let currentPage = that.data.currentPage;
      let replyList = that.data.replyList
      console.log("currentPage == ", currentPage);
      wx.cloud.callFunction({
        name: 'getReplies',
        data: {
          postid: that.data.currentPost.postid,
          userid: app.globalData.userid,
        }
      }).then(resp => {
        console.log(resp.result.data)
        let replyList = resp.result.data
        replyList.map(reply => {
          //控制时间的展示样式，当天的帖子显示小时分钟，非当天的显示日期
          let now = new Date();
          let createTime = new Date(reply.createTime);
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
          reply.createTime = createTime;
          //增加用于判断当前回帖是否有未隐藏回复的字段
          let isCommentOnShow = false
          for (var i = 0; i < reply.comments.length; i++) {
            if (reply.comments[i].status === 1) {
              isCommentOnShow = true
              }
          }
          reply.isCommentOnShow = isCommentOnShow
          reply.comments = reply.comments.reverse()
          reply.comments.map(comment => {
            //控制时间的展示样式，当天的帖子显示小时分钟，非当天的显示日期
            let now = new Date();
            let createTime = new Date(comment.createTime);
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
            comment.createTime = createTime;
            //存入每一个回复回复的楼层的人的nickName
            for (var i = 0; i < reply.comments.length - 1; i++) {
              if (comment.parentid === reply.comments[i]._id) {
                comment.parentNickname = reply.comments[i].replier.nickName
                break
              }
            }
          })
        })
        that.setData({
          replyList: replyList.reverse(),
        })
        resolve()
      }
      )
    }).then(res => {
      that.setData({
        currentPage: that.data.currentPage + 8,
        loading: false
      })
      if (that.data.replyList.length == 0) that.setData({ loaded: true })
      wx.hideLoading()
    })
    //this.fetchReply();
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
      title: this.data.currentPost.title,
      path: '/pages/index/index?curPostId=' + this.data.currentPost.postid + '&isPostShare=' + true,
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

  imagePreview: function(e) {
    let src = e.currentTarget.dataset.src;
    console.log(src)
    wx.previewImage({
      current: src,
      urls: this.data.postImageList,
    })
  },

  onReply: function(e) {
    //先进行特殊字符的转义
    let postid = escape(this.data.currentPost.postid)
    let title = escape(this.data.currentPost.title)
    let author = escape(this.data.currentPost.author.nickName)
    wx.navigateTo({
      url: '../reply/reply?curPostId=' + postid + '&curPostTitle=' + title + '&curPostAuthor=' + author,
    })
  },

  onHeart: function(e) {
    let undo = false;
    let currentPost = this.data.currentPost
    let that = this
    if (this.data.currentPost.isHearted) {
      undo = true
      currentPost.isHearted = false
      this.setData({
        currentPost: currentPost
      })
      wx.showToast({
        title: '取消成功！',
        duration: 1000,
      })
    }
    else {
      currentPost.isHearted = true
      this.setData({
        currentPost: currentPost
      })
      wx.showToast({
        title: '点赞成功！',
        duration: 1000,
      })
    }
    console.log('undo '+undo)
    console.log('currentPost.isHearted ' + currentPost.isHearted)
    wx.cloud.callFunction({
      name: 'doPostAction',
      data: {
        heart: true,
        undo: undo,
        postid: that.data.currentPost.postid,
        userid: app.globalData.userInfo.userid,
      }
    }).then(
      function (resp) {
        if (resp.result.added)
          console.log("heart added")
        else if (resp.result.removed)
          console.log("heart removed")
        else{
          console.log("unmatched")
          if (currentPost.isHearted) currentPost.isHearted = false
          else currentPost.isHearted = true
          console.log(currentPost.isHearted)
        }
        that.setData({
          currentPost: currentPost
        })
      },//result 三个属性中只有一个true；unmatched表示“撤销不存在的赞”或者“收藏已收藏的帖子”。
      /*result = {
          added:true,
          removed: true,
          unmatched: true
        }*/
      function (err) {
        console.log("heart error")
        if (currentPost.isHearted) currentPost.isHearted = false
        else currentPost.isHearted = true
        console.log(currentPost.isHearted)
        that.setData({
          currentPost: currentPost
        })
       }//错误需要处理：可能是“撤销不存在的赞”或者“收藏已收藏的帖子”。;;
    )
  },

  onCollect: function(e) {
    let undo = false;
    let currentPost = this.data.currentPost
    let that = this
    if (this.data.currentPost.isCollected) {
      undo = true
      currentPost.isCollected = false
      this.setData({
        currentPost: currentPost
      })
      wx.showToast({
        title: '取消成功！',
        duration: 1000,
      })
    }
    else {
      currentPost.isCollected = true
      this.setData({
        currentPost: currentPost
      })
      wx.showToast({
        title: '收藏成功！',
        duration: 1000,
      })
    }
    console.log('undo ' + undo)
    console.log('currentPost.isCollected ' + currentPost.isCollected)
    wx.cloud.callFunction({
      name: 'doPostAction',
      data: {
        collect: true,
        undo: undo,
        postid: that.data.currentPost.postid,
        userid: app.globalData.userInfo.userid,
      }
    }).then(
      function (resp) {
        if (resp.result.added)
          console.log("collect added")
        else if (resp.result.removed)
          console.log("collect removed")
        else {
          console.log("unmatched")
          if (currentPost.isCollected) currentPost.isCollected = false
          else currentPost.isCollected = true
          console.log(currentPost.isCollected)
        }
        that.setData({
          currentPost: currentPost
        })
      },//result 三个属性中只有一个true；unmatched表示“撤销不存在的赞”或者“收藏已收藏的帖子”。
      /*result = {
          added:true,
          removed: true,
          unmatched: true
        }*/
      function (err) {
        console.log("collect error")
        if (currentPost.isCollected) currentPost.isCollected = false
        else currentPost.isCollected = true
        console.log(currentPost.isCollected)
        that.setData({
          currentPost: currentPost
        })
      }//错误需要处理：可能是“撤销不存在的赞”或者“收藏已收藏的帖子”。;;
    )
  },

  onReport: function(e) {

  },

  onDelete: function(e) {
    wx.showModal({
      title: '删除帖子',
      content: '确定要删除这篇帖子吗？',
      success: res => {
        if (res.confirm) {
          wx.cloud.database().collection('posts').doc(this.data.currentPost.postid).update({
            data: { status: 0}
          }).then(
            function (resp) {
              console.log(resp)
              //说明删除成功，否则 removed == 0.
              if (resp.stats.updated === 1) {
                wx.showToast({
                  title: '删除成功',
                  duration: 2000
                })
                setTimeout(function () {
                  wx.navigateBack({
                    delta: 1,
                  })
                }, 2200)
              }
              else
                wx.showToast({
                  title: '删除失败\n请检查网络后重试',
                  duration: 2000,
                  icon: 'none'
                })
            },
            function (err) {
              //错误处理。
              wx.showToast({
                title: '删除失败\n请检查网络后重试',
                duration: 2000,
                icon: 'none'
              })
            }
          )
        }
      }
    })
  },

  onComment: function(e){
    let that = this
    //先进行特殊字符的转义
    let _id = escape(e.currentTarget.dataset.curreplyid)
    let postid = escape(this.data.currentPost.postid)
    let content = escape(e.currentTarget.dataset.content)
    let author = escape(e.currentTarget.dataset.author)
    let parentid = e.currentTarget.dataset.parentid
    let isMine = e.currentTarget.dataset.ismine
    let replyList = this.data.replyList
    if (isMine) {
      wx.showModal({
        title: '删除回复',
        content: '您确定要删除这条回复吗？',
        success: res => {
          if (res.confirm) {
            wx.cloud.database().collection('replies').doc(_id).update({
              data: { status: 0 }
            }).then(
              function (resp) {
                //说明删除成功，否则 removed == 0.
                if (resp.stats.updated === 1) {
                  wx.showToast({
                    title: '删除成功',
                    duration: 2000
                  })
                  console.log('parentid ' + parentid)
                  for (var i = 0; i < replyList.length; i++) {
                    if (replyList[i]._id === parentid) {
                      for (var j = 0; j < replyList[i].comments.length; j++) {
                        if (replyList[i].comments[j]._id === _id) {
                          replyList[i].comments[j].status = 0
                          console.log(replyList)
                          that.setData({ replyList: replyList })
                          break
                        }
                      }
                      break
                    }
                  }
                }
                else
                  wx.showToast({
                    title: '删除失败\r\n请检查网络后重试',
                    duration: 2000,
                    icon: 'none'
                  })
              },
              function (err) {
                //错误处理。
                console.log(err)
                wx.showToast({
                  title: '删除失败\r\n请检查网络后重试',
                  duration: 2000,
                  icon: 'none'
                })
              }
            )
          }
        }
      })
    }
    else {
      wx.navigateTo({
        url: '../reply/comment?curPostId=' + postid + '&curReplyContent=' + content + '&curReplyAuthor=' + author + '&_id=' + _id + '&parentid=' + parentid,
      })
    }
  },

  onReplyHeart: function(e) {
    let undo = false;
    let replyList = this.data.replyList
    let that = this
    let _id = e.currentTarget.dataset.curreplyid
    // 创建一个_id和回帖所在下标相对应的字典
    let dict_id_index = Object()
    for (var i = 0; i < replyList.length; i++) {
      dict_id_index[replyList[i]._id] = i
    }
    let currentReply = replyList[dict_id_index[_id]]
    if (currentReply.isHearted) {
      undo = true
      currentReply.isHearted = false
      console.log(this.data.replyList[dict_id_index[_id]])
      this.setData({
        replyList: replyList
      })
      wx.showToast({
        title: '取消成功！',
        duration: 1000,
      })
    }
    else {
      currentReply.isHearted = true
      this.setData({
        replyList: replyList
      })
      wx.showToast({
        title: '点赞成功！',
        duration: 1000,
      })
    }
    console.log(_id)
    wx.cloud.callFunction({
      name: 'doReplyAction',
      data: {
        heart: true,
        undo: undo,
        replyid: _id,
        userid: app.globalData.userInfo.userid,
      }
    }).then(
      function (resp) {
        if (resp.result.added)
          console.log("heart added")
        else if (resp.result.removed)
          console.log("heart removed")
        else {
          console.log("unmatched")
          if (currentReply.isHearted) currentReply.isHearted = false
          else currentReply.isHearted = true
          console.log(currentReply.isHearted)
        }
        that.setData({
          replyList: replyList
        })
      },//result 三个属性中只有一个true；unmatched表示“撤销不存在的赞”或者“收藏已收藏的帖子”。
      /*result = {
          added:true,
          removed: true,
          unmatched: true
        }*/
      function (err) {
        console.log("heart error")
        if (currentReply.isHearted) currentReply.isHearted = false
        else currentReply.isHearted = true
        console.log(currentReply.isHearted)
        that.setData({
          replyList: replyList
        })
      }//错误需要处理：可能是“撤销不存在的赞”或者“收藏已收藏的帖子”。;;
    )
  },

  onReplyCollect: function(e) {
    let undo = false;
    let replyList = this.data.replyList
    let that = this
    let _id = e.currentTarget.dataset.curreplyid
    // 创建一个_id和回帖所在下标相对应的字典
    let dict_id_index = Object()
    for (var i = 0; i < replyList.length; i++) {
      dict_id_index[replyList[i]._id] = i
    }
    let currentReply = replyList[dict_id_index[_id]]
    if (currentReply.isCollected) {
      undo = true
      currentReply.isCollected = false
      console.log(this.data.replyList[dict_id_index[_id]])
      this.setData({
        replyList: replyList
      })
      wx.showToast({
        title: '取消成功！',
        duration: 1000,
      })
    }
    else {
      currentReply.isCollected = true
      this.setData({
        replyList: replyList
      })
      wx.showToast({
        title: '收藏成功！',
        duration: 1000,
      })
    }
    console.log(_id)
    wx.cloud.callFunction({
      name: 'doReplyAction',
      data: {
        collect: true,
        undo: undo,
        replyid: _id,
        userid: app.globalData.userInfo.userid,
      }
    }).then(
      function (resp) {
        if (resp.result.added)
          console.log("collect added")
        else if (resp.result.removed)
          console.log("collect removed")
        else {
          console.log("unmatched")
          if (currentReply.isCollected) currentReply.isCollected = false
          else currentReply.isCollected = true
          console.log(currentReply.isCollected)
        }
        that.setData({
          replyList: replyList
        })
      },//result 三个属性中只有一个true；unmatched表示“撤销不存在的赞”或者“收藏已收藏的帖子”。
      /*result = {
          added:true,
          removed: true,
          unmatched: true
        }*/
      function (err) {
        console.log("collect error")
        if (currentReply.isCollected) currentReply.isCollected = false
        else currentReply.isCollected = true
        console.log(currentReply.isCollected)
        that.setData({
          replyList: replyList
        })
      }//错误需要处理：可能是“撤销不存在的赞”或者“收藏已收藏的帖子”。;;
    )
  },

  onReplyShare: function (e) {

  },

  onReplyReport: function (e) {

  },

  onReplyDelete: function (e) {
    let that = this
    let curreplyid = e.currentTarget.dataset.curreplyid
    let replyList = this.data.replyList
    wx.showModal({
      title: '删除回帖',
      content: '确定要删除这篇回帖吗？',
      success: res => {
        if (res.confirm) {
          wx.cloud.database().collection('replies').doc(curreplyid).update({
            data: { status: 0 }
          }).then(
            function (resp) {
              //说明删除成功，否则 removed == 0.
              if (resp.stats.updated === 1) {
                wx.showToast({
                  title: '删除成功',
                  duration: 2000
                })
                for (var i = 0; i < replyList.length; i++){
                  if (replyList[i]._id == curreplyid) {
                    replyList[i].status = 0
                    that.setData({ replyList: replyList })
                    break
                    }
                }
              }
              else
                wx.showToast({
                  title: '删除失败\n请检查网络后重试',
                  duration: 2000,
                  icon: 'none'
                })
            },
            function (err) {
              //错误处理。
              console.log(err)
              wx.showToast({
                title: '删除失败\n请检查网络后重试',
                duration: 2000,
                icon: 'none'
              })
            }
          )
        }
      }
    })
  },
})