const cloud = require('wx-server-sdk')

cloud.init({
  env: 'whpu-ugbay'
})
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    await db.collection('user_info').doc(event.userid).update({
      data: {
        publishList: event.list
      }
    })
  } catch (e) {
    console.log(e)
  }

}