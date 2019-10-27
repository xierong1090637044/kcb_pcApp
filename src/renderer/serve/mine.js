export default {
	
	
	//得到感谢的人
	get_thanks(){
		return new Promise((resolve, reject) => {
			const query = Bmob.Query("thanks");
			query.order("-star");
			query.include("user");
			query.find().then(res => {
			    resolve(res)
			});
		})
		
	},
	
	//输入需求
	upload_xuqiu(content,color){
		console.log(content,color)
		
		return new Promise((resolve, reject) => {
			let userid = JSON.parse(localStorage.getItem('bmob')).objectId;
			let pointer = Bmob.Pointer('_User')
			let user = pointer.set(userid);
			
			const query = Bmob.Query('thanks');
			query.set("thanks",content)
			query.set("color",color)
			query.set("user",user)
			query.save().then(res => {
				resolve(res)
			}).catch(err => {
			  console.log(err)
			})
		})
	},
}