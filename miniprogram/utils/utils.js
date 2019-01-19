/* 工具文件*/
const app = getApp();
const db = wx.cloud.database();
const curUserId = app.globalData.userid;

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

function getInstitutionList(rankingType, userid, namelist) {

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
          let q = db.collection('institutions').orderBy(rankingType, 'asc');
          if (namelist) {
            console.log('selecting name.', namelist);
            q = q.where({
              name: db.command.in(namelist)
            });
          }
          q.get().then(
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

};

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
          if (resp.data.length >= 1) {
            resolve({
              data: resp.data,
              isSubmitted: true
            });
          } else if (resp.data.length === 0) {
            resolve({
              isSubmitted: false
            });
          } else {
            reject(new Error('错误的application记数。'));
          }
        }
      )
    }
  )
};


const checkRelationshipWith = (targetid) => {
  return new Promise(
    (resolve, reject) => {
      db.collection('user-actions').where({
        userid: app.globalData.userid,
        targetid
      }).count().then(
        res1 => {
          wx.cloud.database().collection('user-actions').where({
            userid: targetid,
            targetid: app.globalData.userid
          }).count().then(
            res2 => {
              resolve({
                myFollowing: res1.total > 0,
                myFollower: res2.total > 0
              });
            })
        },
        err => console.log('error checking relationship ||', err))
    }
  )

};

const followTargetUser = (targetid) => {
  return new Promise(
    (resolve, reject) => {
      db.collection('user-actions').where({
        userid: app.globalData.userid,
        targetid
      }).count().then(res1 => {
        if (res1.total > 0) {
          resolve({
            alreadyFollowing: true
          });
        } else {
          db.collection('user-actions').add({
            data: {
              createTime: new Date(),
              userid: app.globalData.userid,
              targetid
            }
          }).then(
            res2 => {
              console.log('new user action added: ', res2._id);
              resolve({
                ok: true,
                message: `${app.globalData.userid} following ${targetid}`
              });
            },
            err => reject({
              databaseError: true,
              errMsg: err
            })
          )
        }
      })

    }
  )
};

const unfollowTargetUser = (targetid) => {
  return new Promise(
    (resolve, reject) => {
      db.collection('user-actions').where({
        userid: app.globalData.userid,
        targetid
      }).get().then(res1 => {
        if (res1.data.length == 0) {
          resolve({
            notFollowing: true
          })
        } else {
          //var cntRemoved = 0;
          res1.data.forEach(e => {
            db.collection('user-actions').doc(e._id).remove()
            /*.then(
                          res2 => {console.log(res2.stats.removed);cntRemoved = cntRemoved + res2.stats.removed;}
                        )*/
          });
          resolve({
            ok: true
          }); //resolve({cntRemoved});
        }
      })
    }
  )
};

const viewUsersFollowedBy = userid => {

  return new Promise(
    (resolve, reject) => {
      db.collection('user-actions').where({
        userid: userid
      }).get().then(
        res => {
          let uidlist = res.data.map(e => e.targetid);
          wx.cloud.callFunction({
            name: 'getUserInfo',
            data: {
              uidlist,
              userid: app.globalData.userid
            }
          }).then(res => {
            let userlist = res.result.data;
            const promises = userlist.map(e => {
              return new Promise(
                (resolve2, reject2) => {
                  checkRelationshipWith(e._id).then(res1 => {
                    resolve2({
                      user: e,
                      relationshipToCurUser: res1
                    })
                  })
                });
            });
            Promise.all(promises).then(
              res2=>{
                resolve({data:res2});
              }
            );
          })
        }
      )
    }
  )
};

const viewUsersFollowing = userid => {

  return new Promise(
    (resolve, reject) => {
      db.collection('user-actions').where({
        targetid: userid
      }).get().then(
        res => {
          let uidlist = res.data.map(e => e.userid);
          wx.cloud.callFunction({
            name: 'getUserInfo',
            data: {
              uidlist,
              userid: app.globalData.userid
            }
          }).then(res => {
            let userlist = res.result.data;
            const promises = userlist.map(e => {
              return new Promise(
                (resolve2, reject2) => {
                  checkRelationshipWith(e._id).then(res1 => {
                    resolve2({
                      user: e,
                      relationshipToCurUser: res1
                    })
                  })
                });
            });
            Promise.all(promises).then(
              res2 => {
                resolve({ data: res2 });
              }
            );
          })
        }
      )
    }
  )
};

module.exports = {
  collectInstitution,
  getInstitutionList,
  RANK_TYPE,
  submitApplication,
  getMyApplication,
  checkRelationshipWith,
  followTargetUser,
  unfollowTargetUser,
  viewUsersFollowedBy,
  viewUsersFollowing
}