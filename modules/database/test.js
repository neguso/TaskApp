// tests & practices 

var assert = require('assert'),
		database = require('../database'),
		logger = require('../logger');

database.main.open().then((connection) => {

	logger.log('main database models: ', connection.modelNames());

	/// create new document
	database.main.users.create({ email: 'john@example.com - ' + Math.floor(Math.random() * 100), firstname: 'John', password: 'secret' }, (err, newUser) => {
		if(err) return console.log('error creating new user');

		var id = newUser.id;

		/// retrieve document by id
		database.main.users.findById(id, (err, findUser) => {
			if(err) return console.log('error finding user by id');
			assert(findUser !== null, 'should not be null');
		});

		/// retrieve one document by condition
		database.main.users.findOne({ _id: id }, (err, findUser) => {
			if(err) return console.log('error finding users by condition');
			assert(findUser !== null, 'should not be null');
		});
		
		/// retrieve documents by condition
		database.main.users.find({ firstname: 'John' }, (err, findUsers) => {
			if(err) return console.log('error finding users with criteria');
			assert(findUsers.length > 0, 'should find 1 user');
		});

		/// retrieve documents by condition with pagination
		database.main.users.find({}, null, { skip: 2, limit: 3 }, (err, findUsers) => {
			if(err) return console.log('error finding users with criteria and pagination');
			assert(findUsers.length > 0, 'should find users');
		});

		/// retrieve lean documents by condition
		database.main.users.find({}, 'firstname', { lean: true }, (err, findUsers) => {
			if(err) return console.log('error finding lean users with criteria');
			assert(findUsers.length > 0, 'should find users');
		});


		/// populate documents
		database.main.organizations.create({ name: 'my organization' }, (err, newOrganization) => {
			if(err) return console.log('error creating organization');
			database.main.teams.create({ name: 'my team', organization: newOrganization.id }, (err, newTeam) => {
				if(err) return console.log('error creating team');

				// populate using model
				database.main.teams.findOne({ _id: newTeam.id }, null, { lean: true }, (err, team) => {
					if(err) return console.log('error reading team');
					database.main.teams.populate(team, { path: 'organization', select: 'name', options: { lean: true } }, (err, populatedTeam) => {
						if(err) return console.log('error populating team');
						assert(populatedTeam.organization !== null && populatedTeam.organization.name === 'my organization');
					});
				});

				// populate using document
				newTeam.populate({ path: 'organization', select: 'name', options: { lean: true } }, (err, populatedTeam) => {
					if(err) return console.log('error populating team');
					assert(populatedTeam.organization !== null && populatedTeam.organization.name === 'my organization');
				});

				// find & populate
				database.main.teams.findOne({ _id: newTeam.id }, null, { lean: true }).populate({ path: 'organization', select: 'name', options: { lean: true } }).exec((err, populatedTeam) => {
					if(err) return console.log('error populating team');
					assert(populatedTeam.organization !== null && populatedTeam.organization.name === 'my organization');
				});

			});
		});


		/// update document
		newUser.lastname = 'Updated';
		newUser.save((err, updateUser) => {
			if(err) return console.log('error deleting user by document');

			database.main.users.findById(id, (err, findUser) => {
				if(err) return console.log('error finding user');
				assert(findUser.lastname === 'Updated', 'user should be updated');
			});
		});

	});


	/// remove document using document.delete()
	database.main.users.create({ email: 'delete@example.com', firstname: 'Joe', password: 'secret' }, (err, newUser) => {
		if(err) return console.log('error creating user');
		newUser.delete((err, deletedUser) => {
			if(err) return console.log('error deleting user by document');
		});
	});

	/// remove document by id using model.delete()
	database.main.users.create({ email: 'deletebyid@example.com', firstname: 'Joe', password: 'secret' }, (err, newUser) => {
		if(err) return console.log('error creating user');
		database.main.users.deleteById(newUser.id, (err, count) => {
			if(err) return console.log('error deleting user by id');
		});
	});
	
	/// remove documents by condition using model.delete()
	database.main.users.create([{ email: 'deletebycondition1@example.com', firstname: 'a', password: 'secret' }, { email: 'deletebycondition2@example.com', firstname: 'a', password: 'secret' }], (err, newUsers) => {
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
		database.main.users.create([{ email: 'deletedocument1@example.com', firstname: 'b', password: 'secret' }, { email: 'deletedocument2@example.com', firstname: 'b', password: 'secret' }], (err, newUsers) => {
			if(err) return console.log('error creating users');
			database.main.organizationuserlinks.create([{ organization: newOrganization.id, user: newUsers[0].id }, { organization: newOrganization.id, user: newUsers[1].id }], (err, newLinks) => {
				if(err) return console.log('error creating organization-user links');
				database.main.journal.create([{ content: 'journal entry b', entity: newUsers[0].id }, { content: 'journal entry b', entity: newUsers[1].id }], () => {
					if(err) return console.log('error creating journal');
					newUsers[0].delete((err, deletedUser) => {
						if(err) return console.log('error deleting organization-user links');
					});
					newUsers[1].delete((err, deletedUser) => {
						if(err) return console.log('error deleting organization-user links');
					});				
				});
			});
		});

		// using model.delete
		database.main.users.create([{ email: 'deletemodel1@example.com', firstname: 'c', password: 'secret' }, { email: 'deletemodel2@example.com', firstname: 'c', password: 'secret' }], (err, newUsers) => {
			if(err) return console.log('error creating users');
			database.main.organizationuserlinks.create([{ organization: newOrganization.id, user: newUsers[0].id }, { organization: newOrganization.id, user: newUsers[1].id }], (err, newLinks) => {
				if(err) return console.log('error creating organization-user links');
				database.main.journal.create([{ content: 'journal entry c', entity: newUsers[0].id }, { content: 'journal entry c', entity: newUsers[1].id }], () => {
					if(err) return console.log('error creating journal');
					database.main.users.delete({ firstname: 'c' }, (err, count) => {
						if(err) return console.log('error deleting user with criteria');
						assert(count === 2, 'invalid count');
					});
				});
			});
		});
	});


	// expires
	database.main.tokens.create({ token: '12345', expires: new Date(2016, 0, 12, 22, 12) }, (err, token) => {
		if(err) return console.log('error creating token');
		
	});



}, (err) => {
	console.log('error connecting to MongoDB');
});
