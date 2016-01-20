module.exports = {

	logging: function(config)
	{
		return function(req, res, next)
		{
			res.on('finish', () => {
				console.log('%s %s [%s]%s', req.method, req.url, res.statusCode, typeof res.monitor === 'undefined' ? '' : ' - ' + Math.round(res.monitor.elapsed) + 'ms');
			});

			next();
		};
	},
	
	performance: function(config)
	{
		return function(req, res, next)
		{
			var start = process.hrtime();

			res.on('finish', () => {
				var diff = process.hrtime(start);
				var elapsed = (diff[0] * 1e9 + diff[1]) / 1e6;

				// save response time
				res.monitor = {
					elapsed: elapsed
				};
			});

			next();
		};
	}

};
