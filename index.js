
const { download } = require('cartoon-catch/dist/download');
const { getHtml } = require('cartoon-catch/dist/helper/index');
const cheerio = require('cheerio');
const readline = require('readline');

function changeURLPar(destiny, par, par_value){
	let reg = new RegExp(`${par}=[^&]*`);
	let s = '?'
	let replaceText = `${par}=${par_value}`;
	if (destiny.match(reg)){
		tmp = destiny.replace(reg, replaceText);
		return tmp;
	}

	if (destiny.match('[\?]')){
		s = '&'
	}
	
	return destiny + s + replaceText;
}

function question(question){
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return new Promise((resolve) => {
			rl.question(question, (answer) => {
			resolve(answer)
			rl.close();
		});
	})
}

async function run (){
	const targetUrl = await question('豆瓣图片地址：');
	const time = Date.now();
	let path = await question('保存至指定位置(默认当前目录)：') || `./${time}`;
	path += '/'
	if(!targetUrl) return console.log('地址不能为空');
	let now = 0;
	let name = 0;
	let html = await getHtml(targetUrl)
	const $ = cheerio.load(html);
	const total = Number($('.thispage').attr('data-total-page'))

	while(now < total){
		const pageUrl = changeURLPar(targetUrl, 'start', now * 30);
		let html = await getHtml(pageUrl)
		const $ = cheerio.load(html);
		const urls = $('.cover a img').toArray().map(item => {
			let url = $(item).attr('src').replace('/view/photo/m/public/', '/view/photo/raw/public/');
			// let title = url.match(/(\w+)..jpg/)[1];
			name++;
			return {
				url: url,
				path,
				fileName: name,
			};
		});
		await download(urls, {
			title: `第${now+1}页`,
			headers: {
				Referer: 'https://movie.douban.com'
			}
		})
		now++
	}
	
}

run()