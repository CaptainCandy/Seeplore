// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let [postid, userid] = [event.postid, (!event.userid) ? wxContext.OPENID : event.userid];
  let [skip, limit] = [event.skip, event.limit];
  let authorid = event.authorid;
  //let [replyid, ridlist] = [replyid, ridlist];

  var replies = db.collection('replies');
  var query = null;
  var rawlist = null;

  if(postid){
    query = replies.where({
      postid:postid  
    });
  }
  else if (authorid) {
    query = replies.where({
      authorid: authorid
    });
  }
  else{
    throw new Error('You should specify query condtion.')
  }
  /*
  else if(replyid){
    query = replies.where({
      _id: replyid
    });
  }
  */
  query = query.orderBy('createTime','desc');
  if (skip) query = query.skip(skip);
  if (limit) query = query.limit(limit);
  rawlist = (await query.get()).data;


  var aidlist = rawlist.map(elem=>elem.authorid);
  var authorlist = (await cloud.callFunction({
    name: 'getUserInfo',
    data: {
      uidlist: aidlist
    }
  })).result.data;
  var userinfodict = new Array();
  authorlist.forEach(function (elem) { userinfodict[elem._id] = elem.wxUserInfo });

  console.log('get author info.');
  
  //reply actions
  var respActionQ = await cloud.callFunction({
    name: 'getActions',
    data: {
      post: true,
      tidlist: rawlist.map(item => item._id),
      heart: true,
      userid: userid
    }
  })
  var useractions = respActionQ.result.actions;
  var heartedlist = useractions.map(function (ele) { return ele.targetid; })

  //function
  var extract = elem => {
    return {
      replier: userinfodict[elem.authorid],//回帖者的userinfo
      content: elem.text,
      heartCount: elem.heartCount,
      isHearted: heartedlist.some(ele => ele.targetid == item._id),
      isMine: elem.authorid == userid,
      createTime: elem.createTime,
      parentid: elem.parentid,
      postid: elem.postid
    }
  }

  var replylist = rawlist.map(extract).filter(elem=>elem.parentid);
  var commentlist = rawlist.map(extract).filter(elem => elem.parentid);

  // TODO 递归完成投射。

  return {
    data: replylist
  }
}