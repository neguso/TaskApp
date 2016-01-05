// tests & practices 

var assert = require('assert'),
		database = require('../database');

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
		database.main.users.findOne({ _id: id }, (err, findUser) => {
			if(err) return console.log('error finding users by condition');
		});
		
		/// retrieve documents by condition
		database.main.users.find({ firstname: 'John' }, (err, findUsers) => {
			if(err) return console.log('error finding users with criteria');
			assert(findUsers.length === 1, 'should find 1 user');
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

	});

	/// remove document using document.delete()
	database.main.users.create({ email: 'delete@example.com' }, (err, newUser) => {
		if(err) return console.log('error creating user');
		newUser.delete((err, deletedUser) => {
			if(err) return console.log('error deleting user by document');
		});
	});

	/// remove document by id using model.delete()
	database.main.users.create({ email: 'deletebyid@example.com' }, (err, newUser) => {
		if(err) return console.log('error creating user');
		database.main.users.deleteById(newUser.id, (err, count) => {
			if(err) return console.log('error deleting user by id');
		});
	});
	
	/// remove documents by condition using model.delete()
	database.main.users.create([{ email: 'deletebycondition@example1.com', firstname: 'a' }, { email: 'deletebycondition@example2.com', firstname: 'a' }], (err, newUsers) => {
		if(err) return console.log('error creating users');
		database.main.users.delete({ firstname: 'a' }, (err, count) => {
			if(err) return console.log('error deleting user with criteria');
			assert(count === 2, 'invalid count');
		});
	});
	
	/// remove documents with cascade
	database.main.organizations.create({ name: 'default' }, (err, newOrganization) => {
		if(err) return console.log('error creating organization');
		
		// using document.delete()
		database.main.users.create([{ email: 'deletedocument@example1.com', firstname: 'b' }, { email: 'deletedocument@example2.com', firstname: 'b' }], (err, newUsers) => {
			if(err) return console.log('error creating users');
			database.main.organizationuserlinks.create([{ organization: newOrganization.id, user: newUsers[0] }, { organization: newOrganization.id, user: newUsers[1] }], (err, newLinks) => {
				if(err) return console.log('error creating organization-user links');
				newUsers[0].delete((err, deletedUser) => {
					if(err) return console.log('error deleting organization-user links');
				});
				newUsers[1].delete((err, deletedUser) => {
					if(err) return console.log('error deleting organization-user links');
				});				
			});
		});

		// using model.delete
		database.main.users.create([{ email: 'deletemodel@example1.com', firstname: 'c' }, { email: 'deletemodel@example2.com', firstname: 'c' }], (err, newUsers) => {
			if(err) return console.log('error creating users');
			database.main.organizationuserlinks.create([{ organization: newOrganization.id, user: newUsers[0] }, { organization: newOrganization.id, user: newUsers[1] }], (err, newLinks) => {
				if(err) return console.log('error creating organization-user links');
				database.main.users.delete({ firstname: 'c' }, (err, count) => {
					if(err) return console.log('error deleting user with criteria');
					assert(count === 2, 'invalid count');
				});
			});
		});
	});
	
	
}, (err) => {

});
