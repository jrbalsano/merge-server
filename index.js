var _ = require("underscore");
var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var GitHubApi = require("github");

var LISTEN_PORT = 3000;

var github = new GitHubApi({
    version: "3.0.0",
    protocol: "https",
    host: "api.github.com",
    timeout: 5000
});
var app = express();

app.use(bodyParser.json());

function getPullRequestInfo(org, repo, pr, cb) {
	github.pullRequests.get({
	    user: org,
	    repo: repo,
	    number: pr
	}, function(err, res) {

		if (err) {
			console.log(err);
			cb(err, res);
		} else {
			var head = res.head;
		    var base = res.base;

		    cb(false, {
		    	head: {
		    		org: head.repo.owner.login,
		    		repo: head.repo.name,
		    		branch: head.ref
		    	},
		    	base: {
		    		org: base.repo.owner.login,
		    		repo: base.repo.name,
		    		branch: base.ref
		    	}
		    });
		}
	});
}

app.post('/:org/:repo/:pr', function(req, res){
	getPullRequestInfo(req.params.org, req.params.repo, req.params.pr, function(err, pr) {
		if (err) {
			res.json({
		        'status': 'err',
		        'error': JSON.parse(err.message).message
		    });
		} else {

			// Do fancy merge now
			res.json({
		        'status': 'ok'
		    });
		}
	})
});

try {
	var github_creds = JSON.parse(fs.readFileSync('github.json', 'utf8'));
	github.authenticate(github_creds);
} catch (ex) {
	console.log(ex);
	console.log('Failed to read/parse .github credentials');
	process.exit();
}

var server = app.listen(LISTEN_PORT, function () {

	var host = server.address().address;
	var port = server.address().port;
	console.log('Fancy server listening at http://%s:%s', host, port);
});