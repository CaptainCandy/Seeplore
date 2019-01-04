// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {

  console.log(event);
  console.log('参数传入如上。');

  const wxContext = cloud.getWXContext();

  let [postid, userid] = [event.postid, (!event.userid) ? wxContext.OPENID : event.userid];

  var posts = db.collection('posts');

  try{
    var qresult = await posts.doc(postid).get();
    
    var thepost = qresult.data;
    console.log(thepost);

    var respAuthorQ = await cloud.callFunction({
      name: 'getUserInfo',
      data: {
        userid: thepost.authorID
      }
    });
    console.log('HERE: GET author user info RESPONSE')
    console.log(respAuthorQ.result);
    var authorInfo = respAuthorQ.result.wxUserInfo;
    authorInfo.role = elem.role;

    var respTagQ = await db.collection('post-tags').where({
      postid:postid
    }).get();
    console.log('|| Tags are : ', respTagQ.data);

    var respActionQ;
    respActionQ = await cloud.callFunction({
      name: 'getActions',
      data: {
        post: true,
        targetid: postid,
        heart: true,
        userid: userid,
        count:true
      }
    })
    var userheartcount = respActionQ.result.count;
    console.log('userheartcount' + userheartcount);

    respActionQ = await cloud.callFunction({
      name: 'getActions',
      data: {
        post: true,
        targetid: postid,
        collect: true,
        userid: userid,
        count: true
      }
    })
    var usercollectcount = respActionQ.result.count;

    var detailpost = {
      postid: thepost._id,
      isMine: thepost.authorID == userid, 
      title: thepost.title,
      content: thepost.content,
      heartCount: thepost.heartCount,
      isHearted: userheartcount == 1,
      isCollected: usercollectcount == 1,
      tags: respTagQ.data,
      createTime: thepost.createTime,
      author: authorInfo
    }

    return detailpost;
    
  }catch(error){
    console.error(error);
    throw error;
  }

  return 'nothing';
}