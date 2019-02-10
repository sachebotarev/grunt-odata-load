/*
 * grunt-odata-load
 * https://github.com/chebotarev_sa/grunt-odata-load
 *
 * Copyright (c) 2019 Sergey A. Chebotarev
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	const url = require('url');
	const http = require('http');
	const https = require('https');
	const fs = require('fs');
	const path = require('path');
	// external lib
	const minimatch = require('minimatch');


	grunt.registerMultiTask('odata_load_feed', 'Grunt plugin for oData feed load', function () {

		// service Url must be ended by slash
		const fixUrl = (url) => {
			return url.endsWith("/") ? url : (url + "/");
		}

		// marge options
		let options = this.options({
			rewrite: true,
			dest: "./tmp",
			feeds: ["*"],
			mode: "mock"
		});

		grunt.verbose.writeflags(options, 'Options');

		// url check
		if (!options.url) {
			grunt.verbose.error();
			grunt.fail.fatal("oData service ULR not found or empty, set  optons - url");
		}
		grunt.verbose.ok(`oData service ULR: ${options.url}`);

		options.url = fixUrl(options.url);

		// create service url
		let serviceURL = new URL(options.url);

		// authory
		if (options.auth && options.auth.username && options.auth.password) {
			serviceURL.username = options.auth.username,
				serviceURL.password = options.auth.password
		}

		// add format, json only
		serviceURL.searchParams.append("$format", 'json');

		// add top
		if (options.top) {
			serviceURL.searchParams.append("top", options.top);
		}

		// add skip
		if (options.skip) {
			serviceURL.searchParams.append("skip", options.skip);
		}

		// main
		var done = this.async();
		Promise.resolve(serviceURL)
			.then((url) => {
				return getEntitySets(url)
			})
			.then((enitySets) => {
				return filterEntitySet(enitySets)
			})
			.then((filtredEntitySets) => {
				return Promise.all(filtredEntitySets.map((el) => {
					return getFeed(serviceURL, el)
						.then((feed) => saveFeed(feed))
				}))
			})
			.then(() => {
				done(grunt.log.ok())
			})
			.catch((error) => {
				done(error);
				grunt.verbose.error();
				grunt.fail.fatal(error.message);
			})

		// get entity set array from oData service document
		const getEntitySets = (url) => {
			return sendRequest(url)
				.then((res) => {
					return res.d.EntitySets;
				});
		}

		// get oData feed data
		const getFeed = (serviceUrl, entitySetName) => {
			let feedURL = new URL(serviceUrl);
			feedURL.pathname = serviceUrl.pathname + entitySetName;
			return sendRequest(feedURL, entitySetName)
				.then((res) => {
					grunt.log.write(`${entitySetName} -> ${feedURL.href} -> `)
					grunt.verbose.ok();
					return {
						name: entitySetName,
						feed: transformFeed(res, options.mode)
					};
				});
		}

		// filter for entity set
		const filterEntitySet = (entitySets) => {
			return entitySets.filter((el) => matchEnitySetName(el));
		}

		// Match entity name for filter
		const matchEnitySetName = (entitySetName) => {
			return options.feeds.reduce((acc, el) => {
				return acc ? minimatch(entitySetName, el) : acc
			}, true);
		}

		// sens oData request and get body as result
		const sendRequest = (url, entitySetName) => {
			return new Promise((resolve, reject) => {
				getRequestByUrl(url).get(url, (res) => {
					const {
						statusCode
					} = res;
					const contentType = res.headers['content-type'];

					let error;
					if (statusCode !== 200) {
						error = new Error('Request Failed.\n' +
							`Status Code: ${statusCode}`);
					} else if (!/^application\/json/.test(contentType)) {
						error = new Error('Invalid content-type.\n' +
							`Expected application/json but received ${contentType}`);
					}
					if (error) {
						res.resume();
						reject(error);
					}

					res.setEncoding('utf8');
					let rawData = '';
					res.on('data', (chunk) => {
						rawData += chunk;
					});
					res.on('end', () => {
						try {
							resolve(JSON.parse(rawData));
						} catch (error) {
							reject(error);
						}
					});
				}).on("error", (error) => {
					grunt.log.error(`request: ${url} ... ERROR`)
					reject(error);
				})
			})
		}

		// get request by protocol type
		const getRequestByUrl = (url) => {
			let request;
			switch (url.protocol) {
				case 'http:':
					request = http;
					break;
				case "https:":
					request = https;
					break;
				default:
					grunt.fail.fatal(`Protocol ${serviceURL.protocol} not supported`);
			}
			return request;
		};

		// save feed as JSON file
		const saveFeed = ({
			name,
			feed
		}) => {
			return new Promise((resolve, reject) => {
				if (grunt.file.exists(options.dest)) {
					if (!grunt.file.isDir(options.dest)) {
						reject(new Error("Destination must be ditrectory"));
					}
				} else {
					grunt.file.mkdir(options.dest)
				}
				let filename = path.join(options.dest, name + ".json");
				if (grunt.file.exists(filename) && !options.rewrite) {
					grunt.log.write(`file exists, skiped ...`);
					grunt.log.ok();
					resolve(true);
				}
				grunt.file.write(filename, JSON.stringify(feed, null, 4));
				grunt.log.write(`${filename} ...`);
				grunt.log.ok();
				resolve(true);
			})
		}

		// transform oData feed
		const transformFeed = (feed, mode) => {
			switch (mode) {
				case 'mock':
					return feed && feed.d && feed.d.results;
				case 'clean':
					let mockFeed = feed && feed.d && feed.d.results;
					return mockFeed.map( (el) => transformEntiyClean(el))
				case 'none':
					return feed;
				default:
					break;
			}
		}

		// delete object type atrubuttes
		const transformEntiyClean = (entity) => {
			return Object.keys(entity).reduce( (acc,el) => {
				if( typeof entity[el] !== "object"){
					acc[el] = entity[el];
				}
				return acc;
			}, {});
		}
	})

};
