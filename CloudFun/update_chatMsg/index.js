// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'whpu-ugbay'
})
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
    try {
      await db.collection('chatList').doc(event.id).update({
        data: {
          chat: _.push(event.chat_msg)
        }
      })
    } catch (e) {
      console.log(e)
    }
  
}