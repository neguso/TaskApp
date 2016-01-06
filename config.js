module.exports = {
	mongodb: {
		server: '192.168.99.100',
		database: 'test',
		port: 27017
	},
	redis: {
		server: '192.168.99.100',
		port: 6379
	},
	files: {
		server: 'storage',
		port: 9000
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
