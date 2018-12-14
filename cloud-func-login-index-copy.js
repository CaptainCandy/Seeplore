// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()
console.log('where am i???')
/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = (event, context) => {
  console.log('try-catch almost starts.')

  // console.log 的内容可以在云开发云函数调用日志查看
  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  var isOldUser = false; var recordID = null;
  try{
    var queryResult = await cloud.cloud.database().collection('users').where(
      { _openid: context.OPENID }
    ).get()

    console.log('db query success.')

    if (queryResult.data.length==1){

      console.log('old user confirmed.')

      isOldUser = true;
      const retVal = await cloud.callFunction({
        name: 'updateUserInfo',
        data: {
          wxUserInfo: event.userInfo
        }
      })
    }
    else if(queryResult.data.length==0){

      console.log('new user to be created.')

      cloud.database.collection('users').add({
        data:{
          wxUserInfo: event.userInfo,
          createDate: new Date(),
          email: null,
          phone: null,
          role: { isActivated: false, isAgent: false, isActivityManager: false, 
            isAccoundManager: false, isSuperUser: false},
          introduction: null,
          tagsOfInterest: [],
          background: {
            undergraduate: null, graduate: null}
        }
      }).then(recordID_rv=>{
        console.log('new user created:' + recordID_rv)
        this.recordID = recordID_rv
      }).catch(error=>{
        throw { toString: function () { return "database error: failure to add new user!"; } };
      })
    } else  {

      console.log('totally unexpected error.')

      throw { toString: function () { return "More than one user record of the same openid!"; } };
    } 
  }catch(error){
    console.log(error)
  }
  //const wxContext = cloud.getWXContext();

  return {
    recordID,
    isOldUser
  }
}