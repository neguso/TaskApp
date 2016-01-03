var database = require('../database');

database.main.open().then(() => {

	/// create new document
	database.main.users.create({ email: 'john@example.com - ' + Math.floor(Math.random() * 100), firstname: 'John' }, (err, newUser) => {
		if(err) return console.log('error creating new user');

			var id = newUser.id;

			/// retrieve document by id
			database.main.users.findById(id, (err, findUser) => {
				if(err) return console.log('error finding user by id');
			});
			
			/// retrieve one document by condition
			database.main.users.findOne({ _id: id }, (err, findUsers) => {
				if(err) return console.log('error finding users by condition');
			});
			
			/// retrieve documents by condition
			database.main.users.find({}, (err, findUsers) => {
				if(err) return console.log('error finding users with criteria');
			});

			/// retrieve documents by condition with pagination
			database.main.users.find({}, null, { skip: 2, limit: 3 }, (err, findUsers) => {
				if(err) return console.log('error finding users with criteria and pagination');
			});


			/// update document
			newUser.firstname = 'Updated';
			newUser.save((err, updateUser) => {
				if(err) return console.log('error deleting user by document');
			});
			
			
			/// remove document
			database.main.users.create({ email: 'delete@example.com' }, (err, newUser) => {
				newUser.delete((err, deletedUser) => {
					if(err) return console.log('error deleting user by document');
				});
			});

			/// remove document by id
			database.main.users.create({ email: 'deletebyid@example.com' }, (err, newUser) => {
				database.main.users.deleteById(newUser.id, (err, count) => {
					if(err) return console.log('error deleting user by id');
				});
			});
			
			/// remove documents by condition
			database.main.users.create([{ email: 'deletebycondition@example1.com' }, { email: 'deletebycondition@example2.com' }], (err, newUser) => {
				database.main.users.delete({}, (err, count) => {
					if(err) return console.log('error deleting user with criteria');
				});
			});
			
	});
	
	
	
}, (err) => {
	
});
