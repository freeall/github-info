var moment = require('moment');

var printTop = function(ordering, type, arr, count, fn) {
	if (!arr.length) return console.log('This repository has no ' + type.toLowerCase() + 's');

	var header = '';
	header += arr.length > 1 ? 'The ' : '';
	header += Math.min(count, arr.length) + ' ';
	header += arr.length > count ? ordering.toLowerCase() + ' ' : '';
	header += type.toLowerCase();
	header += arr.length > 1 ? 's' : '';

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
			}, function(err, repository) {
				if (err) return callback(err);

				console.log('General information');
				console.log('===================');
				console.log('★  ' + repository.stargazers_count);
				console.log('👀  ' + repository.watchers_count);
				console.log('🍴  ' + repository.forks);
				console.log('https://github.com/'+user+'/'+repo);
				console.log(repository.open_issues_count + ' open issue' + (repository.open_issues_count !== 1 ? 's' : ''));
				console.log('Is a '+(repository.private ? 'private' : 'public')+ ' repository');

				callback();
			});
		},
		tags: function(callback) {
			github.repos.getTags({
				user: user,
				repo: repo
			}, function(err, tags) {
				if (err) return callback(err);

				printTop('Newest', 'tag', tags, 5, function(tag) {
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

				printTop('Oldest', 'Open pull request', prs, 5, function(pr) {
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

				printTop('Newest', 'Closed pull request', prs, 5, function(pr) {
					console.log('#' + pr.number + ' ' + pr.title + ' (Closed ' + moment(pr.closed_at).fromNow() + ')');
				});

				callback();
			});
		}
	};
};