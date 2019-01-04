// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  let userid = event.userid;
  let toViewList = event.toViewList;
  let appliactionid = event.appliactionid;
  let [isApproved, isRejected] = [event.isApproved, event.isRejected];
  let message = event.message;

  //TODO 验证用户的管理员身份。

  if (toViewList){
    return await db.collection('agent-applications').get();
  };

  let data = {isChecked:true, isApproved, message};

  try{
    var res = await db.collection('agent-applications').doc(appliactionid).update({data});
    if(res.stats.updated==1){
      return { updated: true };
    }else{
      return { updated: false };
    }
  }catch(err){
    console.error(err);
  }


}