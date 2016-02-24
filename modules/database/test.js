// tests & practices 

var assert = require('assert'),
		database = require('../database'),
		logger = require('../logger');

database.main.open().then((connection) => {

	logger.log('main database models: ', connection.modelNames());

	// how to access models:
	//   connection.model("User")
	//   database.main.users


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
				database.main.teams
					.findOne({ _id: newTeam.id }, null, { lean: true })
					.populate({ path: 'organization', select: 'name', options: { lean: true } })
					.exec((err, populatedTeam) => {
					if(err) return console.log('error populating team');
					assert(populatedTeam.organization !== null && populatedTeam.organization.name === 'my organization');
				});

			});
		});


		/// update document
		newUser.lastname = 'Updated';
		newUser.save((err, updateUser, numAffected) => {
			if(err) return console.log('error deleting user by document');

			database.main.users.findById(id, (err, findUser) => {
				if(err) return console.log('error finding user');
				assert(findUser.lastname === 'Updated', 'user should be updated');
			});
		});


		/// find one & update
		database.main.organizations.create({ name: 'Umbrella' }, (err, newOrganization) => {
			if(err) return console.log('error creating organization');

			database.main.organizations.updateOne({ name: 'Umbrella' }, { description: 'updated' }, { new: true }, (err, document) => {
				if(err) return console.log('error updateone organization: update');
				assert(document.name === 'Umbrella', 'organization name should be the same');
				assert(document.description === 'updated', 'organization description should be updated');
			});

			database.main.organizations.updateOne({ name: 'nonexiting' }, { name: 'inserted' }, { upsert: true, new: true }, (err, document) => {
				if(err) return console.log('error findone & update organization: insert');
				assert(document.name === 'inserted', 'organization name is incorect');
			});

			database.main.organizations.updateOne({ name: 'nonexiting' }, { description: 'inserted' }, { upsert: true, new: true }, (err, document) => {
				assert(err !== null, 'should fail because name is required');
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

	/// remove document by id using model.deleteById()
	database.main.users.create({ email: 'deletebyid@example.com', firstname: 'Joe', password: 'secret' }, (err, newUser) => {
		if(err) return console.log('error creating user');
		database.main.users.deleteById(newUser.id, (err, numAffected) => {
			if(err) return console.log('error deleting user by id');
		});
	});
	
	/// remove documents by condition using model.delete()
	database.main.users.create([{ email: 'deletebycondition1@example.com', firstname: 'a', password: 'secret' }, { email: 'deletebycondition2@example.com', firstname: 'a', password: 'secret' }], (err, newUsers) => {
		if(err) return console.log('error creating users');
		database.main.users.delete({ firstname: 'a' }, (err, numAffected) => {
			if(err) return console.log('error deleting user with criteria');
			assert(numAffected === 2, 'invalid number of records affected');
		});
	});
	
	/// remove documents with cascade
	database.main.organizations.create({ name: 'default' }, (err, newOrganization) => {
		if(err) return console.log('error creating organization');
		
		// using document.delete()
		database.main.users.create([{ email: 'deletedocument1@example.com', firstname: 'b', password: 'secret' }, { email: 'deletedocument2@example.com', firstname: 'b', password: 'secret' }], (err, newUsers) => {
			if(err) return console.log('error creating users');
			database.main.organizationuserlinks.create([{ organization: newOrganization.id, user: newUsers[0].id, role: 'owner' }, { organization: newOrganization.id, user: newUsers[1].id, role: 'admin' }], (err, newLinks) => {
				if(err) return console.log('error creating organization-user links');
				database.main.journal.create([{ content: 'journal entry b', entity: newUsers[0].id }, { content: 'journal entry b', entity: newUsers[1].id }], () => {
					if(err) return console.log('error creating journal');
					newUsers[0].delete((err, deletedUser) => {
						if(err) return console.log('error deleting user 1');
					});
					newUsers[1].delete((err, deletedUser) => {
						if(err) return console.log('error deleting user 2');
					});				
				});
			});
		});

		// using model.delete()
		database.main.users.create([{ email: 'deletemodel1@example.com', firstname: 'c', password: 'secret' }, { email: 'deletemodel2@example.com', firstname: 'c', password: 'secret' }], (err, newUsers) => {
			if(err) return console.log('error creating users');
			database.main.organizationuserlinks.create([{ organization: newOrganization.id, user: newUsers[0].id, role: 'owner' }, { organization: newOrganization.id, user: newUsers[1].id, role: 'admin' }], (err, newLinks) => {
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



}, (err) => {
	console.log('error connecting to MongoDB');
});




function ModelsRepository(model)
{
	this.model = model;
}

ModelsRepository.prototype.model = null;

/// Get one document by id.
///   options  := { fields: 'f1 f2 ...', sort: <sort>, lean: <bool>, populate: <populate> }
///   sort     := { f1: 1|-1, f2: 1|-1, ... }
///   populate := { path: <path>, model: <string>, select: 'f1 f2 ...', lean: <bool> }
///   callback := (err, document) => {}
ModelsRepository.prototype.get = function(id, options, callback)
{
	// model.findById(...)[.populate(...)]
};

/// Get documents by condition.
///   options  := { fields: 'f1 f2 ...', sort: <sort>, skip: <number>, limit: <number>, lean: <bool>, populate: <populate> }
///   populate := { path: <path>, model: <string>, select: 'f1 f2 ...', lean: <bool> }
///   callback := (err, documents) => {}
ModelsRepository.prototype.read = function(condition, options, callback)
{
	// model.findOne(...)[.populate(...)] if take == 1
	// model.find(...)[.populate(...)] if take > 1
};

/// Populate one or more documents.
///   documents := document|array
///   options   := { path: <path>, model: <string>, select: 'f1 f2 ...', lean: <bool> }
///   callback  := (err, documents) => {}
ModelsRepository.prototype.populate = function(documents, options, callback)
{
	// model.populate(...)
};

/// Create a new document.
///   object   := { f1: <any>, f2: <any>, ... }
///   callback := (err, document) => {}
ModelsRepository.prototype.create = function(object, callback)
{
	// preupdate
	// model.create(...)
	// postupdate
};

/// Update documents that match condition.
///   object   := { f1: <any>, f2: <any>, ... }
///   options  := { upsert: <bool>, sort: <sort>, limit: <number> }
///   callback := (err, document) => {}
ModelsRepository.prototype.update = function(condition, object, options, callback)
{
	// model.findOne(...) if take == 1
	// model.find(...) if take > 1
	// +
	// preupdate
	// document.save()
	// postupdate
};

/// Save one or more documents.
///   documents := document|array
///   callback := (err, documents) => {}
ModelsRepository.prototype.save = function(documents, callback)
{
	// preupdate
	// document.save()
	// postupdate
};

/// Delete one or more documents.
///   condition := condition
///   callback := (err, documents) => {}
ModelsRepository.prototype.delete = function(condition, callback)
{
	// model.find(...)
	// +
	// pre remove
	// model.remove(...)
	// post remove
};

ModelsRepository.prototype.preupdate = null;
ModelsRepository.prototype.postupdate = null;
ModelsRepository.prototype.predelete = null;
ModelsRepository.prototype.postdelete = null;
