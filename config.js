module.exports = {
	mongodb: {
		server: '192.168.99.100',
		database: 'main',
		port: 27017
	},
	redis: {
		server: '192.168.99.100',
		port: 6379
	},

	// accounts service
	accounts: {
		port: 9001,
		timeout: {
			session: 30, // minutes
			ticket: 14 // days
		}
	},

	// organizations service
	organizations: {
		port: 9002
	},

	// files service
	files: {
		location: 'c:/temp',
		port: 9000,
		server: '127.0.0.1'
	},

	web: {
		port: 8000,
		secure: false
	},
	api: {
		port: 8001,
		secure: false
	},
	socket: {
		port: 8002,
		secure: false
	}
};
