// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

/*
[Boolean] recent: 标识按发布时间排序；
[Boolean] hot: 标识按热度（查看量或点赞数）排序；
[Array] ids: 获取列表中postid所对应的帖子；
[Array] tags: 检索所带有的标签完整包含tags的帖子；
[Array] words: 检索absract / titile包含words的帖子。
不需要用到的参数，调用时不赋值；recent,hot,ids之间只能有有一个的值存在。
[Number] skip：从第几条记录开始；
[Number] limit：返回记录条数上限。
skip和limit的默认值分别为0和20，它们主要用于分页。

Post列表，每一条记录的字段包括：标题、作者、摘要、关键词、内容、浏览量、点赞数……
*/
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  
  let [recent, hot, ids] = [event.recent, event.hot, event.ids];
  let [tags, words] = [event.tags, event.words];
  let [skip, limit] = [event.skip, event.limit];
  let ref = null;
  let userid = event.userid;

  var num = [recent, hot, ids].filter(obj => obj != undefined).length;
  if (num>1){
    throw new Error('only one of recent, hot, ids should be passed in.');
    console.log('para err.');
    return;
  } else{
    var posts = db.collection('posts').where({
      status: 1
    });
  } 
  
  if (recent){
    ref = posts.orderBy('createTime', 'desc');
  }else if(hot){
    ref = posts.orderBy('heartCount', 'desc');
  }else if(ids){
    ref = posts.where({
      authorID:db.command.in(ids)
    });
  }

  if(words){
    //
  }
  if(tags){
    //
  }

  const size = await ref.count();

  if (skip){
    ref = ref.skip(skip);
  }
  if (limit) {
    ref = ref.limit(limit);
  }

  var resp;
  resp = await ref.get(); 
  var rawpostlist = resp.data;

  //console.log(rawpostlist) 此处rawpostlist内部的createTime还是Date类型。

  var useridlist = rawpostlist.map(item=>item.authorID);

  resp = await cloud.callFunction({
    name: 'getUserInfo',
    data:{
      uidlist:useridlist
    }
  })

  var userinfolist = resp.result.data;//.map(function(item){return item.wxUserInfo;})
  var userinfodict = new Array();
  userinfolist.forEach(function(elem){userinfodict[elem._id]=elem.wxUserInfo});

  var respActionQ = await cloud.callFunction({
    name:'getActions',
    data:{
      post: true, 
      tidlist: rawpostlist.map(item => item._id),
      heart: true,
      userid: userid
    }
  })
  var useractions = respActionQ.result.actions;
  var heartedpostlist = useractions.map(function(ele){return ele.targetid;})

  var extract = function(item){
    var authorinfo = userinfodict[item.authorID];
    return {
      postid: item._id,
      isMine: item.authorID == userid || item._openid == wxContext.OPENID, // 如果是从客户端调用。 //
      abstract: item.abstract,
      title: item.title,
      content: item.content,
      heartCount: item.heartCount,
      isHearted: heartedpostlist.some(ele=>ele.targetid==item._id),
      tags: item.tags,
      createTime: item.createTime,
      author:authorinfo
    }
  }

  return {
    data: rawpostlist.map(extract),
    size: size
  }
}