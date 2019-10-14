// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'whpu-ugbay'
})
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async(event, context) => {
  for (let i = 0; i < 2; i++) { //给发起者和接受者添加对话记录
    try {
      await db.collection('user_info').doc(event.stuInfo[i]).update({
        data: {
          chatList: _.push(event.stuInfo[2])
        }
      })
    } catch (e) {
      console.log(e)
    }
  }
}