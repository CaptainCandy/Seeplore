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

  if (toViewList){
    return await db.collection('agent-applications').get();
  };

  let data = {isChecked:true, isApproved, message};

  try{
    let res1 = await db.collection('agent-applications').doc(appliactionid).update({data});
    if(res1.stats.updated==1){
      let res3 = await db.collection('agent-applications').doc(appliactionid).get();
      console.log(res3);
      let res2 = await db.collection('users').doc(userid).update({
        data:{
          role: {
            isAgent: res3.data.name
          }
        }
      })
      return { updated: true };
    }else{
      return { updated: false };
    }
  }catch(err){
    console.error(err);
  }


}