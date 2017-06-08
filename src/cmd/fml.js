/* eslint-disable */
const fml = require('random_fml');
exports.run = async function (msg) {
    const post = await fml();
    msg.edit({ embed: {
        color: settings.embedColor,
        description: post
    } });
};

exports.props = {
    name        : 'fml',
    usage       : '{command}fml',
    aliases     : ['fuckmylife', 'fmylife'],
    description : 'Returns a random FML from http://www.fmylife.com.'
};

/*const rp = require('request-promise-native')
const cheerio = require('cheerio')

const opts = {
	uri: 'http://www.fmylife.com/random',
	transform: body => cheerio.load(body, {normalizeWhitespace: true})
}

let cache = []

module.exports = function FML() {
	return new Promise((resolve, reject) => {
		rp(opts)
			.then($ => {
				if(cache.length === 0) {
					cache = $('article p.block a').map(function() {
						return $(this).text()
					}).get();					
					console.log('new fetch' + cache.length)
				}

				if(cache.length === 0) reject('Couldt not find any FMLs. Service down?')
				else resolve(cache.pop().trim())
			})
			.catch(err => reject('Error when finding random FML: ' + error))
		})
}
*/