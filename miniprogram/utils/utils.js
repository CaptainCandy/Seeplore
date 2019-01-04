/* 工具文件*/

let collectInstitution = function(institutionName, userid) {
  const db = wx.cloud.database();
  const actions = db.collection('institution-actions');
  const cond = {
    target: institutionName,
    userid: userid
  }
  const q = actions.where(cond);
  return new Promise((resolve, reject) => {
    q.get().then(
      res => {
        let collected = null;
        let total = res.data.length;
        if (total == 1) {
          let id = res.data[0]._id;
          actions.doc(id).remove().then(console.log);
          collected = false;
          resolve({
            collected
          });
        } else if (total == 0) {
          actions.add({
            data: cond
          }).then(console.log);
          collected = true;
          resolve({
            collected
          });
        } else {
          throw new Error('|| multiple collection records. ||')
        }
      }
    )
  });
};

function getInstitutionList(rankingType, userid) {

  const db = wx.cloud.database();
  return new Promise(
    (resolve, reject) => {
      db.collection('institution-actions').where({
        userid
      }).get().then(
        resp => {
          let targets = new Set(resp.data.map(
            elem => elem.target
          ));
          db.collection('institutions').orderBy(rankingType, 'asc').get().then(
            resp => {
              let lsInstitutions = resp.data.map(
                elem => {
                  return {
                    ranking: elem[rankingType],
                    name: elem.name,
                    country: elem.country,
                    location: elem.location,
                    introduction: elem.introduction,
                    collected: targets.has(elem.name)
                  }
                }
              );
              resolve({
                lsInstitutions
              });
            },
            err => {
              console.log(err)
            }
          )
        },
        err => reject
      )
    }
  )

}

const RANK_TYPE = {
  usnews: "rankusnews",
  times: "ranktimes",
  qs: "rankqs"
};

let submitApplication = (agentInfo) => {
  const app = getApp();
  let userid = app.globalData.userid;

  const db = wx.cloud.database();
  agentInfo.userid = userid;
  agentInfo.isChecked = false;
  agentInfo.createTime = new Date();

  return new Promise(
    (resolve, reject) => {
      db.collection('agent-applications').add({
        data: agentInfo
      }).then(
        resp => {
          console.log(resp._id);
          resolve({
            isSubmitted: true
          });
        },
        err => {
          console.error('|| ERROR! ||', err);
          resolve({
            isSubmitted: false
          })
        }
      )
    }
  )

};

let getMyApplication = () => {
  const app = getApp();
  let userid = app.globalData.userid;

  return new Promise(
    (resolve, reject) => {
      wx.cloud.database().collection('agent-applications').where({
        userid
      }).get().then(
        resp => {
          if(resp.data.length >= 1){
            resolve({ data: resp.data, isSubmitted: true});
          }
          else if(resp.data.length === 0){
            resolve({ isSubmitted: false });
          }else{
            reject(new Error('错误的application记数。'));
          }
        }
      )
    }
  )
};

let getPostsHeartedByUser = (userid) => {
  return new Promise(
    (resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getActions',
        data: {
          heart: true,
          post: true,
          userid
        }
      }).then(
        res => {
          let lsPostid = res.result.actions.map(e => e.targetid);
          resolve(wx.cloud.callFunction({
            name: 'getPostList',
            data: {
              ids: lsPostid,
              userid: userid // 当前登录用户的ID
            }
          })) //.then(res => resolve(res));
        }
      )
    }
  )
}

module.exports = {
  collectInstitution,
  getInstitutionList,
  RANK_TYPE,
  submitApplication,
  getMyApplication,
  getPostsHeartedByUser
}