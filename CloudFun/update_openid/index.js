const cloud = require('wx-server-sdk')

cloud.init({
  env: 'whpu-ugbay'
})
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    await db.collection(event.collectionName).doc(event._id).update({
      data: {
        _openid: event._openid
      }
    })
  } catch (e) {
    console.log(e)
  }

}