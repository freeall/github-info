#!/usr/bin/env node

var gh = require('github-with-auth');
var moment = require('moment');

if (process.argv.length !== 3 || process.argv[2].indexOf('/') === -1) {
	console.log('Usage:   repo-info user/repository.');
	console.log('Example: repo-info freeall/repo-info');
	process.exit(1);
}

var user = process.argv[2].split('/')[0];
var repo = process.argv[2].split('/')[1];

gh(['repo'], function(err, github) {
	info(github, function(err) {
		if (err) throw err;

		console.log();
		openPullRequests(github, function(err) {
			if (err) throw err;

			console.log();
			closedPullRequests(github, function(err) {
				if (err) throw err;

				console.log();
				tags(github, function(err) {
					if (err) throw err;
				});
			});
		});
	});
});

var info = function(github, callback) {
	github.repos.get({
		user: user,
		repo: repo
	}, function(err, repo) {
		if (err) return callback(err);

		console.log('General information');
		console.log('===================');
		console.log('★  ' + repo.stargazers_count + '  👀  ' + repo.watchers_count + '  🍴  ' + repo.forks);
		console.log(repo.full_name);
		console.log('Open issues: ' + repo.open_issues_count);
		console.log('Is a '+(repo.private ? 'private' : 'public')+ ' repository');

		callback();
	});
};
var printTop = function(type, arr, count, fn) {
	if (!arr.length) return console.log('This repository has no ' + type.toLowerCase());

	type = 'Top ' + count + ' ' + type.toLowerCase();
	console.log(type);
	console.log(Array(type.length+1).join('='));

	arr.splice(0, count).forEach(fn);
};
var tags = function(github, callback) {
	github.repos.getTags({
		user: user,
		repo: repo
	}, function(err, tags) {
		if (err) return callback(err);

		printTop('Releases/tags', tags, 5, function(tag) {
			console.log(tag.name);
		});

		callback();
	});
};
var openPullRequests = function(github, callback) {
	github.pullRequests.getAll({
		user: user,
		repo: repo,
		state: 'open',
		sort: 'created',
		direction: 'asc'
	}, function(err, prs) {
		if (err) return callback(err);

		printTop('Open pull requests', prs, 5, function(pr) {
			console.log('#' + pr.number + ' ' + pr.title + ' (Created ' + moment(pr.created_at).fromNow() + ')');
		});

		callback();
	});
};
var closedPullRequests = function(github, callback) {
	github.pullRequests.getAll({
		user: user,
		repo: repo,
		state: 'closed',
		sort: 'created',
		direction: 'desc'
	}, function(err, prs) {
		if (err) return callback(err);

		printTop('Closed pull requests', prs, 5, function(pr) {
			console.log('#' + pr.number + ' ' + pr.title + ' (Closed ' + moment(pr.closed_at).fromNow() + ')');
		});

		callback();
	});
};