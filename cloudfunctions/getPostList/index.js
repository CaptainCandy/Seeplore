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
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();
  console.log('\n', event);

  let [recent, hot, ids] = [event.recent, event.hot, event.ids];
  let [tags, words] = [event.tags, event.words];
  let [skip, limit] = [event.skip, event.limit];
  let authorid = event.authorid;
  let ref = null;
  let userid = (!event.userid) ? wxContext.OPENID : event.userid;

  let num = [recent, hot, ids].filter(obj => obj != undefined).length;
  if (num > 1) {
    throw new Error('only one of recent, hot, ids should be passed in.');
    console.log('para err.');
    return;
  } else {
    var posts = db.collection('posts');
  }

  let condition = {status: 1};

  if (recent) {
    ref = posts.orderBy('createTime', 'desc');
  } else if (hot) {
    ref = posts.orderBy('heartCount', 'desc');
  } else {
    ref = posts;
  } 
  if (ids) {
    condition._id = db.command.in(ids);
  } 

  if (words) {
    if (!(words instanceof Array)) {
      throw new Error('tags should be an array.');
    } else {
      let reg = db.RegExp({
        regexp: words.join('|'),
        options: 'i'
      });
      console.log(db.command.or([{
        abstract: reg
      },
      {
        title: reg
      }
      ]));
      condition['$or'] = [{
            abstract: reg
          },
          {
            title: reg
          }
        ];
    }
  } else if (tags) {
    if (!(tags instanceof Array)) {
      throw new Error('tags should be an array.');
    } else {
      let res = await db.collection('post-tags').where({
        tag: db.command.in(tags)
      }).get();
      let postsTagged = new Set(res.data.map(elem => elem.postid));
      condition._id = db.command.in(Array.from(postsTagged));
      //不需要在list页面呈现每个post拥有的全部tag，只需要取出不重复的post列表
    }
  } 
  if (authorid){
    condition.authorID = authorid;
  };

  ref = ref.where(condition);

  const size = (await ref.count()).total;

  if (skip) {
    ref = ref.skip(skip);
  }
  if (limit) {
    ref = ref.limit(limit);
  } else{
    ref = ref.limit(30);
  }

  console.log('|| Query: ||', ref);

  var resp;
  resp = await ref.get();
  var rawpostlist = resp.data;

  //console.log(rawpostlist) //此处rawpostlist内部的createTime还是Date类型。

  var useridlist = rawpostlist.map(item => item.authorID);

  resp = await cloud.callFunction({
    name: 'getUserInfo',
    data: {
      uidlist: useridlist
    }
  });

  var userinfolist = resp.result.data; //.map(function(item){return item.wxUserInfo;})
  var userinfodict = new Array();
  //console.log('\n || userinfolist|| \n', userinfolist);
  userinfolist.forEach(function(elem) {
    elem.wxUserInfo.role = elem.role;
    userinfodict[elem._id] = elem.wxUserInfo;
  });

  var respActionQ, useractions;
/*
  respActionQ = await cloud.callFunction({
    name: 'getActions',
    data: {
      post: true,
      tidlist: rawpostlist.map(item => item._id),
      heart: true,
      userid: userid
    }
  })
  useractions = respActionQ.result.actions;
  var heartedpostlist = useractions.map(function(ele) {
    return ele.targetid;
  });

  respActionQ = await cloud.callFunction({
    name: 'getActions',
    data: {
      post: true,
      tidlist: rawpostlist.map(item => item._id),
      collect: true,
      userid: userid
    }
  })
  useractions = respActionQ.result.actions;
  var collectedpostlist = useractions.map(function(ele) {
    return ele.targetid;
  });
*/
  //console.log("|| userinfodict ||\n ", userinfodict);
  var extract = function(item) {
    var authorinfo = userinfodict[item.authorID];
    if(authorinfo){
      authorinfo.userid = item.authorID;
    }else{
      console.log('\n here : ||',item)
    }
    
    return {
      postid: item._id,
      isMine: item.authorID == userid || item._openid == wxContext.OPENID, // 如果是从客户端调用。 //
      abstract: item.abstract,
      title: item.title,
      content: item.content,
      //heartCount: item.heartCount,
      //isHearted: heartedpostlist.some(ele => ele == item._id),
      //isCollected: collectedpostlist.some(ele => ele == item._id),
      //tags: item.tags,
      createTime: item.createTime,
      author: authorinfo
    }
  }

  return {
    data: rawpostlist.map(extract),
    size: size // 全部符合条件的记录数，忽略skip和limit。
  }
}