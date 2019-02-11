/*
 * grunt-odata-load
 * https://github.com/chebotarev_sa/grunt-odata-load
 *
 * Copyright (c) 2019 Sergey A. Chebotarev
 * Licensed under the MIT license.
 */

'use strict';

const url = require('url');


module.exports = function (grunt) {

	const { URL } = require('url');
	const http = require('http');
	const https = require('https');
	const fs = require('fs');
	const path = require('path');

	grunt.registerMultiTask('odata_load_metadata', 'Grunt plugin for oData metadata load', function () {

		// marge options
		let options = this.options({
			rewrite: true,
			dest: "./tmp",
			filename: "metadata.xml"
		});

		grunt.verbose.writeflags(options, 'Options');

		// Service url check
		if (!options.url) {
			grunt.verbose.error();
			grunt.fail.fatal("oData service ULR not found or empty, set  optons - url");
		}
		grunt.verbose.ok(`oData service ULR: ${options.url}`);

		let metadataUrl = new URL(options.url + "/$metadata");

		// main
		let done = this.async();
		Promise.resolve(metadataUrl)
			.then((url) => {
				return sendRequest(url)
			})
			.then((metadata) => {
				return saveMetadata(metadata)
			})
			.then(() => {
				done(grunt.log.ok())
			})
			.catch((error) => {
				done(error);
				grunt.verbose.error();
				grunt.fail.fatal(error.message);
			})

		const saveMetadata = (metadata) => {
			return new Promise((resolve, reject) => {
				if (grunt.file.exists(options.dest)) {
					if (!grunt.file.isDir(options.dest)) {
						reject(new Error("Destination must be ditrectory"));
					}
				} else {
					grunt.file.mkdir(options.dest)
				}
				let filename = path.join(options.dest, options.filename);
				if (grunt.file.exists(filename) && !options.rewrite) {
					grunt.log.write(`file exists, skiped ...`);
					grunt.log.ok();
					resolve(true);
				}
				grunt.file.write(filename, metadata);
				grunt.log.write(`${filename} ...`);
				grunt.log.ok();
				resolve(true);
			})
		}

		const sendRequest = (url) => {
			return new Promise((resolve, reject) => {
				getRequestByUrl(url).get(url, (res) => {
					const {
						statusCode
					} = res;

					let error;
					if (statusCode !== 200) {
						error = new Error('Request Failed.\n' +
							`Status Code: ${statusCode}`);
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
							resolve(rawData);
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
	});

};
