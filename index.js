#!/usr/bin/env node

var gh = require('../github-with-auth');
var moment = require('moment');
var minimist = require('minimist');
var Repository = require('./repository');

var showRepo = function(github, user, repo) {
	var repository = Repository(github, user, repo);
	repository.info(function(err) {
		if (err) throw err;

		console.log();
		repository.openPullRequests(function(err) {
			if (err) throw err;

			console.log();
			repository.closedPullRequests(function(err) {
				if (err) throw err;

				console.log();
				repository.tags(function(err) {
					if (err) throw err;
				});
			});
		});
	});
};
var showUser = function(github, user) {
	github.search.issues({
		q: 'user:'+user+' is:pr is:open',
		per_page: 100
	}, function(err, issues) {
		if (err) throw err;
		console.log('Showing '+(issues.items.length > 100 ? 'top 100' : issues.items.length) + ' open pull requests for '+user);

		issues.items = issues.items.map(function(issue) {
			var url = issue.url.split('/');
			return {
				repo: url[4] + '/' + url[5],
				number: issue.number,
				title: issue.title
			};
		});
		issues.items.sort(function(a,b) {
			return a.number - b.number;
		});
		var repos = issues.items.reduce(function(res, issue) {
			if (res.indexOf(issue.repo) === -1) return res.concat(issue.repo);
			return res;
		}, []);
		repos.forEach(function(repo) {
			var items = issues.items.filter(function(issue) {
				return issue.repo === repo;
			});

			console.log(repo + ' (' + items.length + ')');
			items.forEach(function(issue) {
				console.log('   #'+issue.number + ' ' + issue.title);
			});
			console.log();
		});
	});
};

gh(['repo'], function(err, github) {
	var argv = minimist(process.argv.splice(2));
	var rest = argv._.length ? argv._[0] : '';

	var user = rest.split('/')[0];
	var repo = rest.split('/')[1];

	if (user && repo) return showRepo(github, user, repo);
	if (user) return showUser(github, user);

	console.log('Usage: github-info username[/repository]');
});
