// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let [postid, authorid] = [event.postid, event.authorid];
  let [skip, limit] = [event.skip, event.limit];
  let userid = (!event.userid) ? wxContext.OPENID : event.userid;
  //let [replyid, ridlist] = [replyid, ridlist];

  var replies = db.collection('replies');
  var query = null;
  var rawlist = null;

  if (postid) {
    query = replies.where({
      postid:postid  
    });
  }
  if (authorid) {
    query = replies.where({
      authorid: authorid
    });
  }
  if(!postid && !authorid){
    throw new Error('You should specify query condtion.');
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

  console.log('raw reply list get');
  console.log(rawlist);

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
      reply: true,
      tidlist: rawlist.map(item => item._id),
      heart: true,
      userid: userid
    }
  })
  var useractions = respActionQ.result.actions;
  var heartedlist = useractions.map(function (ele) { return ele.targetid; });
  var collectedlist = (await cloud.callFunction({
    name:'getActions',data:{
      reply: true,
      tidlist: rawlist.map(item => item._id),
      collect: true,
      userid: userid
    }
  })).result.actions.map(function (ele) { return ele.targetid; });

  //function
  var extract_reply = elem => {
    return {
      _id: elem._id,
      replier: userinfodict[elem.authorid],//回帖者的userinfo
      content: elem.text,
      heartCount: elem.heartCount,
      isHearted: heartedlist.some(ele => ele.targetid == item._id),
      isMine: elem.authorid == userid,
      isCollected: collectedlist.some(ele => ele.targetid == item._id),
      createTime: elem.createTime,
      postid: elem.postid,
      comments:[]
    }
  }

  var extract_comment = elem => {
    return {
      _id: elem._id,
      replier: userinfodict[elem.authorid],//回帖者的userinfo
      content: elem.text,
      createTime: elem.createTime,
      parentid: elem.parentid,
      postid: elem.postid
    }
  }

  var replylist = rawlist.filter(elem => !elem.parentid).map(extract_reply);
  var commentlist = rawlist.filter(elem => elem.parentid).map(extract_comment);
  //console.log(replylist);
  //console.log(commentlist);

  // Put the comments inside the replies.
  var dict_replycomments = Object();
  var dict_commentparent = Object();
  replylist.forEach(elem => {
    dict_replycomments[elem._id] = elem.comments;
  });
  commentlist.forEach(elem => {
    dict_commentparent[elem._id] = elem.parentid;
  });
  commentlist.forEach(elem => {
    let parent = elem.parentid;
    while(!(parent in dict_replycomments)){
      parent = dict_commentparent[parent];//if parentid is the same as _id, while-loop will not stop.
    }
    dict_replycomments[parent].push(elem);
  });

  return {
    data: replylist
  }
}