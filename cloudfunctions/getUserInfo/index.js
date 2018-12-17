// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let openid = event.openid;
  let userid = event.userid;
  let uidlist = event.uidlist;
  let fields = event.fields;
  let [colleting, hearting, following] = [event.colleting, event.hearting, event.following];
  let ref = null;
  let retval = 'null';

  if(!fields){
    fields = {
      ["wxUserInfo.nickName"]: true,
      "wxUserInfo.avatarUrl": true,
      _openid:true
    }
  }

  if (uidlist){
    ref = db.collection('users').where({
      _id:db.command.in(uidlist)
    });
    
    try{
      return await ref.field(fields).get();
    }catch(err){
      console.error(err);
    }
  }

  if (!openid && !userid) {
    throw new Error( "neither userid nor openid passed in");
    return;
  } else if (userid) {
    ref = db.collection('users').doc(userid);
  } else {
    ref = db.collection('users').where({
      _openid: openid
    });
  }

  try {
    retval = await ref.field(fields).get(); //retval.data指向该记录的对象;;
  } catch (err) {
    console.error(err);
  }

  if(hearting){
    //const tmpretval = await db.collection('actions').where()//
    //retval.data.hearting = tmpretval.data//是一个列表,可能需要map操作;;
  }
  
  return retval;
}