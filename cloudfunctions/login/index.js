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
  let isOldUser = 'null'; let recordID = 'null';
  var how = 'how'
  let what = 'what'
  var objv = {}
  let objl = {}
  const wxContext = cloud.getWXContext();
  console.log(wxContext);
  db.collection('users').where(
    { _openid: wxContext.OPENID }
  ).get().then(result=>{
    if(result.data.length == 1){//当前用户已存在 ;;;;
      how = 'how fuck';what = 'what fuck';
      objv.how = how;
      objl.how = how;
      console.log('inside then')
      console.log(how,what)
      isOldUser = true; recordID = result.data[0]._id;
      console.log('$ an old user.' + recordID);

      cloud.callFunction({
        name: 'updateUserInfo',
        data:{
          userid: recordID,
          updates:{
            wxUserInfo: event.myUserInfo
          } 
        }
      }).then(retval=>{
        if(retval.result.stats.updated!=1){
          //console.error(' $ update went wrong.')
        }
      }).catch(err=>{
        console.log(err);
        throw err;
      });
    }else if(result.data.length == 0){
      console.log('$ new user to add.');
      isOldUser = false;
      db.collection('users').add({
        data: {
          _openid: wxContext.OPENID,
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
        recordID = recordID_rv._id;
        how = 'stop fucking me.'
        console.log(how)
        console.log(recordID);
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
  console.log('outside then')
  console.log(how,what)
  console.log(objv,objl)

  return {
    userid: recordID,
    openid: wxContext.OPENID,
    isOldUser: isOldUser
  };
};