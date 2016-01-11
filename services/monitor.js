module.exports = {

	logging: function(req, res, next)
	{
		res.on('finish', () => {
			console.log('%s %s [%s]%s', req.method, req.url, res.statusCode, typeof res.monitor === 'undefined' ? '' : ' - ' + res.monitor.elapsed + 'ms');
		});
	},
	
	response: function(req, res, next)
	{
		var start = process.hrtime();

		res.on('finish', () => {
			var hrtime = process.hrtime(start);
			var elapsed = parseFloat(hrtime[0] + (hrtime[1] / 1000000).toFixed(3), 10);

			// save 
			res.monitor = {
				elapsed: elapsed
			};
		});

		next();
	}
	
};
