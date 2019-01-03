const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

/*
 * 新增、修改tag，创建tag的跳转关系
 * tag的属性包括：_id, description, category, redirect
 * _id是中文键名，即tag name
 * unsolved: 更新taginfo失败的情况下，同样会新建redirect；由于异步，return value是无效的。
 * 
 * !!!!!!!!!!!! 后台使用then可能是有问题的，需要改成await。
 */

exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();
  const userid = (!event.userid) ? wxContext.OPENID : event.userid;
  let [tag, category, description] = [event.tag, event.category, event.description];
  let [link, redirect] = [event.link, event.redirect];
  let alias = event.alias;

  if (typeof tag != 'string') {
    throw new Error('|| tag must be a String. ||');
  }

  let tagdata;
  if (redirect) {
    tagdata = {
      redirect
    };
  } else {
    tagdata = {
      category,
      description,
      link
    };
  }
  try {
    db.collection('tags').doc(tag).update({ //更新数据。
      data: tagdata
    }).then(
      resp => console.log(resp),
      err => { //若不存在该条记录，则新建。
        console.log('记录不存在');
        console.error(err);
        tagdata['_id'] = tag;
        db.collection('tags').add({
          data: tagdata
        }).then(
          resp => console.log(resp),
        )
      }
    );

    console.log('连接别名');
    if (alias) {
      if (!(alias instanceof Array)) {
        console.log('别名是一个数组。');
        alias = [alias]
      }
      alias.forEach(function(alias) {
        db.collection('tags').add({
          _id: alias,
          redirect: tag
        }).then(
          resp => console.log(resp),
        )
      })

    }
  } catch (error) {
    return error;
  } finally {
    return 0;
  }

}