// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()

const db = cloud.database()
/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = (event, context) => {

  // console.log 的内容可以在云开发云函数调用日志查看
  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）;;;
  var isOldUser = false; var recordID = null;
  db.collection('users').where(
    { _openid: context.OPENID }
  ).get().then(result=>{
    if(result.data.length == 1){//当前用户已存在 ;;;;
      console.log('$ an old user.')
      var isOldUser = true;
      cloud.callFunction({
        name: 'updateUserInfo',
        data:{
          userid: result.data[0]._id,
          updates:{
            wxUserInfo: event.myUserInfo
          } 
        }
      }).then(retval=>{
        if(retval.result.stats.updated!=1){
          console.error(' $ update went wrong.')
        }
      }).catch(err=>{
        console.log(err);
      });
    }else if(result.data.length == 0){
      console.log('$ new user to add.')
      db.collection('users').add({
        data: {
          wxUserInfo: event.myUserInfo,
          createDate: new Date(),
          email: null,
          phone: null,
          role: {
            isActivated: false, isAgent: false, isActivityManager: false,
            isAccoundManager: false, isSuperUser: false
          },
          introduction: "",
          tagsPreferred: [],
          background: {
            undergraduate: null, graduate: null
          }
        }
      }).then(recordID_rv => {
        console.log('$ new user created:' + recordID_rv._id);
        var recordID = recordID_rv._id;
      }).catch(error => {
        throw { toString: function () { return "database error: failure to add new user!"; } };
      })
    }else{
      throw { toString: function () { return "More than one user record of the same openid!"; } };
    }
  }).catch(err=>{
    console.log(err);
    throw err;
  });

  return {
    recordID: this.recordID,
    isOldUser: this.isOldUser
  };
};