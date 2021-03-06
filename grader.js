#!/usr/bin/env node

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://serene-ravine-9380.herokuapp.com";

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1);
	}
	return instr;
};

var assertUrlExists = function(inurl) {
	var url = inurl.toString();
	rest.get(url).on('complete', function(result){
				if (result instanceof Error) {
					console.log("%s does not exist. Exiting.", url);
					process.exit(1);
				} else {
					return url;
				}
			})
}

var cheerioHtmlUrl = function(url) {
	var urlcontent = rest.get(url).on('complete', function(result){
				return result;
			})
	return cheerio.load(urlcontent);	
}

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
	$ = cheerioHtmlFile(htmlfile);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};

var checkHtmlUrl = function(url, checksfile) {
	$ = cheerioHtmlUrl(url);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};


var clone = function(fn) {
	return fn.bind({});
}

if(require.main == module) {
	program
		.option('-C, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <url_address>', 'url address', clone(assertUrlExists), URL_DEFAULT)
		.parse(process.argv);
	if (program.file){
		var checkJson = checkHtmlFile(program.file, program.checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
	}
	else if (program.url){
		var checkJson = checkHtmlUrl(program.url, program.checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
	}
} else {
	exports.checkHtmlFile = checkHtmlFile;
}
