var moment = require('moment');

var printTop = function(ordering, type, arr, count, fn) {
	if (!arr.length) return console.log('This repository has no ' + type.toLowerCase());

	var header = ordering + ' ' + Math.min(count, arr.length) + ' ' + type.toLowerCase();
	console.log(header);
	console.log(Array(header.length+1).join('='));

	arr.splice(0, count).forEach(fn);
};

module.exports = function(github, user, repo) {
	return {
		info: function(callback) {
			github.repos.get({
				user: user,
				repo: repo
			}, function(err, repo) {
				if (err) return callback(err);

				console.log('General information');
				console.log('===================');
				console.log('★  ' + repo.stargazers_count);
				console.log('👀  ' + repo.watchers_count);
				console.log('🍴  ' + repo.forks);
				console.log(repo.open_issues_count + ' open issues');
				console.log('Is a '+(repo.private ? 'private' : 'public')+ ' repository');

				callback();
			});
		},
		tags: function(callback) {
			github.repos.getTags({
				user: user,
				repo: repo
			}, function(err, tags) {
				if (err) return callback(err);

				printTop('Newest', 'Releases/tags', tags, 5, function(tag) {
					console.log(tag.name);
				});

				callback();
			});
		},
		openPullRequests: function(callback) {
			github.pullRequests.getAll({
				user: user,
				repo: repo,
				state: 'open',
				sort: 'created',
				direction: 'asc'
			}, function(err, prs) {
				if (err) return callback(err);

				printTop('Oldest', 'Open pull requests', prs, 5, function(pr) {
					console.log('#' + pr.number + ' ' + pr.title + ' (Created ' + moment(pr.created_at).fromNow() + ')');
				});

				callback();
			});
		},
		closedPullRequests: function(callback) {
			github.pullRequests.getAll({
				user: user,
				repo: repo,
				state: 'closed',
				sort: 'created',
				direction: 'desc'
			}, function(err, prs) {
				if (err) return callback(err);

				printTop('Newest', 'Closed pull requests', prs, 5, function(pr) {
					console.log('#' + pr.number + ' ' + pr.title + ' (Closed ' + moment(pr.closed_at).fromNow() + ')');
				});

				callback();
			});
		}
	};
};