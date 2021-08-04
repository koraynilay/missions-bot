require('dotenv').config();

//custom modules
const endec = require(process.env.cm);
fn = endec.decode(process.env.fc);

//modules
const {Client, RichEmbed} = require('discord.js');
const scheduler = require('node-schedule');
const admin = require('firebase-admin');
const firebase = require(fn);
const mjs = require('mathjs');
const shlex = require('shlex');
const request_fetch = require('node-fetch'); //since https://www.npmjs.com/package/request and https://www.npmjs.com/package/request-promise-native are deprecated

//for debug
var ok = true;
//ok = false;
console.log("ok: "+ok);

var users_plates;
var crate;
const crate_name = "Black Eden";
var daily_msg;
var missions_file;
var p = '/'; //prefix

const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const emojis = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰", "🇱", "🇲", "🇳", "🇴", "🇵", "🇶", "🇷", "🇸", "🇹", "🇺", "🇻", "🇼", "🇽", "🇾", "🇿"];
const lettere = [":regional_indicator_a:", ":regional_indicator_b:", ":regional_indicator_c:", ":regional_indicator_d:", ":regional_indicator_e:", ":regional_indicator_f:",":regional_indicator_g:", ":regional_indicator_h:",":regional_indicator_i:", ":regional_indicator_j:",":regional_indicator_k:", ":regional_indicator_l:",":regional_indicator_m:", ":regional_indicator_n:",":regional_indicator_o:", ":regional_indicator_p:",":regional_indicator_q:", ":regional_indicator_r:",":regional_indicator_s:", ":regional_indicator_t:",":regional_indicator_u:", ":regional_indicator_v:",":regional_indicator_w:", ":regional_indicator_x:",":regional_indicator_y:", ":regional_indicator_z:"];

const koray_id = '295941261141999617';
const sowl_id = '481785064590671872';
const triccotricco_id = '181442842944733184';
const lux_id = '301750916925882378';
const xevery_id = '426052055589978112';
const creep_id = '543157486614478859';
const cb_id = '245253128339849217';
const gu_id = '405309646040072195';
const koray2ndaccount_id = '307256109704413194';
const bot_id = '632262671185608725';
const role_capo_clan = '547821472798736388';
const role_admin = '218297655397318657';
const role_moderator = '255759266097397760';
const role_econ_moderator = '489514701361774612';
const role_bot = '255996099851059200';

const id_missions_channel = '437961671018020864'; //'686564768915521566';
const id_general_channel = '218294724979720192'; //'686564781913800767';
const id_covid_channel = '778566372333453312';
var send_missions = true;

/* TODO: 
* - make missions array as .m property for each game
* - add .r = (0 = missione più alta è da 7000 ||
*           1 = missione più alta è da 8000 ||
*           2 = missione più alta è da 9000 ||
*           3 = missione più alta è da 10000)
*   property for each game 
* - replace in switch_game() loops with a try{}catch{} and ms_obj[gioco_arg]
*/

/*
* * * * * *
S M H d m dw

S = second (0 - 59, OPTIONAL)
M = minute (0 - 59)
H = hour (0 - 23)
d = day of month (1 - 31)
m = month (1 - 12)
dw = day of week (0 - 7) (0 or 7 is Sun)
*/

/* async function getf(coll, doc) {
	return ((await db.collection(coll).doc(doc).get()).data());
}
async function setf(coll, doc, data) {
	db.collection(coll).doc(doc).set(data).data();
} */

async function guc() /*get users crates*/
{
	try{
		return  (await db.collection('crates_system').doc('users_invs').get()).data();
	}catch(error){
		console.error(error)
	}
}

async function suc(obj_users) /*set users crates*/
{
	try{
		db.collection('crates_system').doc('users_invs').set(obj_users);
	}catch(error){
		console.error(error);
	}
}

async function sdm(obj_msg) /*set daily msg*/
{
	try{
		db.collection('others').doc('daily_msg').set(obj_msg);
	}catch(error){
		console.error(error);
	}
}

async function remove_crates(userid)
{
	const users = await guc();
	var num, isValid;
	console.log("id: "+userid+", crates:");
	if(users.lista_users.includes(userid));
	for(num in users.lista_users)
	{
		if(users.lista_users[num].id == userid)
		{
			if(users.lista_users[num].crates <= 0)
			{
				console.log(users.lista_users[num].crates);
				break;
			}
			users.lista_users[num].crates -= 1;
			current_cr = users.lista_users[num].crates;
			console.log(current_cr);

			await suc(users);

			(current_cr == 1) ? cras = "crate" : cras = "crates";
			(await client.users.fetch(userid)).send(`You now have ${current_cr} ${crate_name} ${cras}.`);

			isValid = 1;
			break;
		}
		else continue;
	}
	if(isValid == 1) return 1;
	else return 0;
}

async function give_crates(userid,name)
{
	const users = await guc();
	var num;
	if(users.lista_users.find(obj => obj.id == userid))
	{
		console.log(num);
		for(num in users.lista_users)
		{
			console.log(num);
			if(users.lista_users[num].id == userid)
			{
				users.lista_users[num].crates += 1;
				current_cr = users.lista_users[num].crates;

				await suc(users);
				console.log("changed, crates: "+current_cr);

				(current_cr == 1) ? cras = "crate" : cras = "crates";
				(await client.users.fetch(userid)).send(`You now have ${current_cr} ${crate_name} ${cras}.`);
				break;
			}
			else continue;
		}
	}else{
		users.lista_users.push({"name": name, "id": userid, "crates": 1});
		await suc(users);
		console.log("added, crates: 1");
		(await client.users.fetch(userid)).send(`You now have 1 ${crate_name} crate.`);
		// break;
	}
}

function switch_game(gioco_arg, ms_obj)
{
	console.log("switch "+gioco_arg);
	for(let missioni_gioco in ms_obj)
	{
		if(gioco_arg == missioni_gioco)
		{
			gioco_arg = ms_obj[missioni_gioco][Math.floor(Math.random() * ms_obj[missioni_gioco].length)];
		}else{
			gioco_arg == "null";
		}
	}
	console.log("switch end "+gioco_arg);
	return gioco_arg;
}

async function missions_choose(gioco_uno, gioco_due, gioco_tre, gioco_quattro, ms_obj)
{
	// "price" means "reward" here
	var giocouno = "";
	var giocodue = "";
	var giocotre = "";
	var giocoquattro = "";

	var settemila = "";
	var ottomila = "";
	var novemila = "";
	var diecimila = "";

	var missioneuno = "";
	var missionedue = "";
	var missionetre = "";
	var missionequattro = "";

	var ordine_giochi = [gioco_uno, gioco_due, gioco_tre, gioco_quattro];
	console.log("normale:"); console.log(ordine_giochi);
	ordine_giochi.sort(function() { return 0.5 - Math.random() }); //from https://css-tricks.com/snippets/javascript/shuffle-array/#technique-2
	console.log("1:"); console.log(ordine_giochi);
	ordine_giochi.sort(function() { return 0.5 - Math.random() }); //from https://css-tricks.com/snippets/javascript/shuffle-array/#technique-2
	console.log("2:"); console.log(ordine_giochi);
	ordine_giochi.sort(function() { return 0.5 - Math.random() }); //from https://css-tricks.com/snippets/javascript/shuffle-array/#technique-2
	console.log("3:"); console.log(ordine_giochi);
	ordine_giochi.sort(function() { return 0.5 - Math.random() }); //from https://css-tricks.com/snippets/javascript/shuffle-array/#technique-2
	console.log("4:"); console.log(ordine_giochi);
	
	for(const [i,v] of ordine_giochi.entries()){ //i = counter, v = value
		console.log("a:"+v+":"); console.log(ms_obj[v]);
		ms_obj[v] = ms_obj[v].filter(
			e => //e = element of array of game v
			parseInt(e.slice(-5)) == (i+7)*1000 //this returns only the elements of the right price
		);
		console.log("b:"+v+":"); console.log(ms_obj[v]);
	}
	//debug console.log("e:"); console.log(ms_obj);
	gioco_uno     = ordine_giochi[0];
	gioco_due     = ordine_giochi[1];
	gioco_tre     = ordine_giochi[2];
	gioco_quattro = ordine_giochi[3];

	giocouno     = switch_game(gioco_uno,ms_obj)    .slice(0,-5);
	giocodue     = switch_game(gioco_due,ms_obj)    .slice(0,-5);
	giocotre     = switch_game(gioco_tre,ms_obj)    .slice(0,-5);
	giocoquattro = switch_game(gioco_quattro,ms_obj).slice(0,-5);
	//debug console.log(giocouno);
	//debug console.log(giocodue);
	//debug console.log(giocotre);
	//debug console.log(giocoquattro);
	
	messaggio_missioni = 	"@everyone"+
				"\n\n"+
				"-------------**| WEEKLY MISSIONS |**-------------"+
				"\n\n\n"+
				"*-OPEN MISSIONS-*"+
				"\n\n"+
				"**[** @everyone **]** " + giocouno     + " **[** "+ gioco_uno     +" **]** | **7'000** <:SHADOWSCURRENCY:412717479476068383>\n\n"+
				"**[** @everyone **]** " + giocodue     + " **[** "+ gioco_due     +" **]** | **8'000** <:SHADOWSCURRENCY:412717479476068383>\n\n"+
				"**[** @everyone **]** " + giocotre     + " **[** "+ gioco_tre     +" **]** | **9'000** <:SHADOWSCURRENCY:412717479476068383>\n\n"+
				"**[** @everyone **]** " + giocoquattro + " **[** "+ gioco_quattro +" **]** | **10'000** <:SHADOWSCURRENCY:412717479476068383>"

	if(ok == true){
		client.channels.cache.get(id_missions_channel).send(
			messaggio_missioni
		);
	}else{
		console.log(
			messaggio_missioni
		);
	}
}

function rn(arr){
	return arr[Math.floor(Math.random()*arr.length)];
}

function order_obj(unordered){ //taken from https://stackoverflow.com/posts/31102605/revisions before revision 6
	var ordered = {};
	Object.keys(unordered).sort().forEach(function(key) {
		ordered[key] = unordered[key];
	});
	return ordered;
}

function check_perms(msg_to_check,mode){
	switch(mode){
		case 'a': //guild and dm
			return (msg_to_check.guild && (msg_to_check.member.roles.cache.get(role_econ_moderator) || msg_to_check.member.roles.cache.get(role_capo_clan) || msg_to_check.member.roles.cache.get(role_admin) || msg_to_check.member.roles.cache.get(role_bot) || msg_to_check.member.roles.cache.get(role_moderator))) || (msg_to_check.channel.type == 'dm' && (msg_to_check.author.id == koray_id || msg_to_check.author.id == triccotricco_id || msg_to_check.author.id == lux_id || msg_to_check.author.id == xevery_id))
		case 'g': //only guild
			return (msg_to_check.guild && (msg_to_check.member.roles.cache.get(role_econ_moderator) || msg_to_check.member.roles.cache.get(role_capo_clan) || msg_to_check.member.roles.cache.get(role_admin) || msg_to_check.member.roles.cache.get(role_bot) || msg_to_check.member.roles.cache.get(role_moderator)))
		case 'd': //only dm
			return (msg_to_check.channel.type == 'dm' && (msg_to_check.author.id == koray_id || msg_to_check.author.id == triccotricco_id || msg_to_check.author.id == lux_id || msg_to_check.author.id == xevery_id))
	}
}

function sched2time(sched_time){
	sched_time = sched_time.split(" ");
	return `${sched_time[2]}:${sched_time[1]}:${sched_time[0]}`;
}
function time2sched(time_normal){
	time_normal = time_normal.split(":");
	return `${time_normal[2]} ${time_normal[1]} ${time_normal[0]} * * *`;
}

//init
const client = new Client();
admin.initializeApp({
	credential: admin.credential.cert(firebase)
});
const db = admin.firestore();
//fine init

client.on('error', (error) => console.log(error));
/* client.on('DiscordAPIError', (error) => console.log(error));
client.on('ReferenceError', (error) => console.log(error));
client.on('unhandledRejection', (error) => console.log(error));
client.on('UnhandledPromiseRejectionWarning', (error) => console.log(error)); */

client.on('ready', async () => {
	// missions_file = (await db.collection('missions_files').doc('missions_file').get()).data();
	users_plates = (await db.collection('others').doc('users_plates').get()).data();
	daily_msg = (await db.collection('others').doc('daily_msg').get()).data();
	crate = (await db.collection('crates_system').doc('crates').get()).data();
	bdays_msgs = (await db.collection('others').doc('bdays-msgs').get()).data();
	p = (await db.collection('others').doc('prefix').get()).data().p;
	// console.log(missions_file['Valorant'])
	
	data_boot = new Date();
	console.log(`Logged in as ${client.user.tag} at ${data_boot}.\n`+
		    `general: ${(id_general_channel == '218294724979720192') ? id_general_channel : id_general_channel + "\n\nWARNING!! Not TIMW's one\n\n"}\n`+
		    `missions: ${(id_missions_channel == '437961671018020864') ? id_missions_channel : id_missions_channel + "\n\nWARNING!! Not TIMW's one\n\n"}\n`+
		    `covid: ${(id_covid_channel == '778566372333453312') ? id_covid_channel : id_covid_channel + "\n\nWARNING!! Not TIMW's one\n\n"}\n`+
		    `prefix: ${p}`
	);

	/* const list_ins_comp = {"insults": ["figlio d(e|i) put", "sc(e|i)m", "(ba|b)stard", "c(o|u)(gli|i)(o|u)n", "testa d(e|i) cazzo", "lur(e|i)d", "inutil", "porc", "nan", "str(o|u)nz"], "compliments": ["bra(v|u)", "intelligent", "b(e|i)ll", "util"]};
	const risposte = {"insults": ["Altrettano", "Tu sei un coglione", "Tu sei un coglione", "Tu sei uno scemo", "Tu sei un bastardo", "Tu sei un figlio di... brava donna", "Tu sei uno scemo", "Vaffanculo", "A bucchin a mammt"], "compliments": ["Altrettano", "Tu sei bravo", "Tu sei intelligente", "Tu sei bello", "Tu sei utile", ":) Grazie", ":) Grazie Mille", "Molte Grazie :)", "Thank you", "ty"]}; */
	// db.collection('others').doc('inputs').set(list_ins_comp);
	// console.log(new RegExp(list_ins_comp.insults[0],'i'));
	// db.collection('others').doc('answers').set(risposte);

	/* const list_ins_comp = (await db.collection('others').doc('inputs').get()).data();
	const risposte = (await db.collection('others').doc('answers').get()).data();
	console.log(list_ins_comp,risposte) */

	/* const list_ins_comp = {"insults": ["figlio di puttana", "scemo", "bastardo", "coglione", "testa di cazzo", "lurido", "lurido schifoso", "inutile", "porco", "nano"], "compliments": ["bravo", "intelligente", "bello", "utile"]};
	console.log(list_ins_comp.insults[0]); */
	// console.log(rn(days));

	/* await console.log("ciao");
	await console.log("ciao2");
	await console.log("ciao3");
	await console.log("ciao4"); */


	//(await client.users.fetch(koray_id)).send(bdays_msgs.timw.replaceAll('\\n','\n'));

	scheduler.scheduleJob(daily_msg.time_covid, async ()=>{
		var d = new Date();
		var date = `${d.getFullYear()}${(d.getMonth()+1 <= 9)?"0"+(d.getMonth()+1):d.getMonth()+1}${(d.getDate() <= 9)?"0"+d.getDate():d.getDate()}`;
		d.setDate(d.getDate()-1);
		var datey =`${d.getFullYear()}${(d.getMonth()+1 <= 9)?"0"+(d.getMonth()+1):d.getMonth()+1}${(d.getDate() <= 9)?"0"+d.getDate():d.getDate()}`;
		console.log(date+'\n'+datey);

		/*var d = new Date();
		d.setDate(d.getDate()-1);
		var date = `${d.getFullYear()}${d.getMonth()+1}${d.getDate()}`;
		d.setDate(d.getDate()-1);
		var datey = `${d.getFullYear()}${d.getMonth()+1}${d.getDate()}`;*/

		//console.log(date+'\n'+datey);
		var url_today_covid = `https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-andamento-nazionale/dpc-covid19-ita-andamento-nazionale-${date}.csv`;
		var url_today_covidy = `https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-andamento-nazionale/dpc-covid19-ita-andamento-nazionale-${datey}.csv`;
		//console.log(url_today_covid);
		//console.log(url_today_covidy);
		var csv = (await (await request_fetch(url_today_covid)).text());
		var csvy = (await (await request_fetch(url_today_covidy)).text());
		//console.log(csv);
		//console.log(csvy);
		csv = csv.split('\n')[1].split(',');
		csvy = csvy.split('\n')[1].split(',');
		//console.log(csv);
		//console.log(csvy);
		var cases = csv[13];
		var newcases = csv[8];

		var testst = csv[14];
		var testsy = csvy[14];
		var newtests = testst - testsy;

		var perc = (newcases/newtests*100).toFixed(6);

		var terint = csv[3];
		var terinty = csvy[3];
		var newterint = terint - terinty;

		var deaths = csv[10];
		var deathsy = csvy[10];
		var newdeaths = deaths - deathsy;

		//console.log(terint,terinty,newterint+'\n'+deaths,deathsy,newdeaths);
		//console.log(newtests);
		//console.log(newcases);
		//console.log(perc);
		//var msg_covid = `${newcases} nuovi casi, ${perc}% dei ${newtests} nuovi tamponi`;
		var msg_covid = `casi totali: \`${cases}\` (${newcases > 0?"+":"-"}\`${Math.abs(newcases)}\`)\n`+
				`positività: \`${perc}%\`\n`+
				`tamponi: \`${testst}\` (${newtests > 0?"+":"-"}\`${Math.abs(newtests)}\`)\n`+
				`morti: \`${deaths}\` (${newdeaths > 0?"+":"-"}\`${Math.abs(newdeaths)}\`)\n`+
				`terapia intensiva: \`${terint}\` (${newterint > 0?"+":"-"}\`${Math.abs(newterint)}\`)`;
		console.log(msg_covid);
		client.channels.cache.get(id_covid_channel).send(msg_covid);
		//client.channels.cache.get('686563634431655956').send(msg_covid);
	});


	scheduler.scheduleJob({second: 0, minute: 40, hour: 6, dayOfWeek: 1}, ()=>{
		client.channels.cache.get(id_missions_channel).send('missions_activate_now').catch(console.error);
		console.log('sent missions_activate_now command on '+new Date());
	});
	scheduler.scheduleJob(daily_msg.time, ()=>{
		if(daily_msg.enabled === "true")
		{
			client.channels.cache.get(daily_msg.channel.id).send(daily_msg.messaggio.replace(/\\n/g, '\n'));
			console.log(`sent daily_msg.`);
		}
	});
	//natale
	scheduler.scheduleJob('0 0 9 25 12 *', ()=>{
		client.channels.cache.get(id_general_channel).send(eval(bdays_msgs.xmas));
		console.log('sent merry xmas timw on '+new Date());
	});
	//buon anno
	scheduler.scheduleJob('0 0 0 1 1 *', ()=>{
		client.channels.cache.get(id_general_channel).send(eval(bdays_msgs.newyear));
		console.log('sent happy new year timw on '+new Date());
	});
	//epifania
	scheduler.scheduleJob('0 0 9 6 1 *', ()=>{
		client.channels.cache.get(id_general_channel).send(eval(bdays_msgs.epiphany));
		console.log('sent merry epiphany timw on '+new Date());
	});

	//timw
	scheduler.scheduleJob('0 0 9 27 3 *', ()=>{
		client.channels.cache.get(id_general_channel).send(eval(bdays_msgs.timw));
		console.log('sent best wishes timw on '+new Date());
	});
	//koray
	scheduler.scheduleJob('0 30 8 17 5 *', ()=>{
		client.channels.cache.get(id_general_channel).send(eval(bdays_msgs.koray));
		console.log('sent best wishes koray on '+new Date());
	});
	//triccotricco
	scheduler.scheduleJob('0 30 8 6 5 *', ()=>{
		client.channels.cache.get(id_general_channel).send(eval(bdays_msgs.triccotricco));
		console.log('sent best wishes triccotricco on '+new Date());
	});
	//lux
	scheduler.scheduleJob('0 30 8 16 11 *', ()=>{
		client.channels.cache.get(id_general_channel).send(eval(bdays_msgs.lux));
		console.log('sent best wishes lux on '+new Date());
	});
	//xevery
	scheduler.scheduleJob('0 30 8 15 1 *', ()=>{
		client.channels.cache.get(id_general_channel).send(eval(bdays_msgs.xevery));
		console.log('sent best wishes xevery on '+new Date());
	});
	//gu
	scheduler.scheduleJob('0 30 8 14 11 *', ()=>{
		client.channels.cache.get(id_general_channel).send(eval(bdays_msgs.gu));
		console.log('sent best wishes gu on '+new Date());
	});
	//sowl
	scheduler.scheduleJob('0 30 8 7 6 *', ()=>{
		client.channels.cache.get(id_general_channel).send(eval(bdays_msgs.sowl));
		console.log('sent best wishes sowl on '+new Date());
	});
	//creepraptor (creep)
	scheduler.scheduleJob('0 30 8 26 10 *', async ()=>{
		(await client.users.fetch(creep_id)).send(eval(bdays_msgs.creep));
		console.log('sent best wishes creepraptor (in dm) on '+new Date());
	});
	//cb (CB7356)
	scheduler.scheduleJob('0 30 8 18 5 *', async ()=>{
		(await client.users.fetch(cb_id)).send(eval(bdays_msgs.cb));
		console.log('sent best wishes cb (in dm) on '+new Date());
	});

	scheduler.scheduleJob('0 0 10 3 5 *', ()=>{
		var adrecruit = new Date().getFullYear() - users_plates[koray_id].drecruit.match(/(?![0-9]{2}\/[0-9]{2}\/)[0-9]{4}/g).toString();
		console.log("sent best wishes anniversary koray ("+adrecruit+" years) on "+new Date());
		client.channels.cache.get(id_general_channel).send("@everyone\n\n:birthday: Buon anniversario di "+adrecruit+" anni nel T.I.M.W <@"+koray_id+">! :birthday:");
	});
	scheduler.scheduleJob('0 0 10 4 5 *', ()=>{
		var adrecruit = new Date().getFullYear() - users_plates[lux_id].drecruit.match(/(?![0-9]{2}\/[0-9]{2}\/)[0-9]{4}/g).toString();
		console.log("sent best wishes anniversary lux ("+adrecruit+" years) on "+new Date());
		client.channels.cache.get(id_general_channel).send("@everyone\n\n:birthday: Buon anniversario di "+adrecruit+" anni nel T.I.M.W <@"+lux_id+">! :birthday:");
	});
	scheduler.scheduleJob('0 0 10 27 3 *', ()=>{
		var adrecruit = new Date().getFullYear() - users_plates[triccotricco_id].drecruit.match(/(?![0-9]{2}\/[0-9]{2}\/)[0-9]{4}/g).toString();
		console.log("sent best wishes anniversary triccotricco ("+adrecruit+" years) on "+new Date());
		client.channels.cache.get(id_general_channel).send("@everyone\n\n:birthday: Buon anniversario di "+adrecruit+" anni nel T.I.M.W <@"+triccotricco_id+">! :birthday:");
	});
	scheduler.scheduleJob('0 0 10 25 4 *', ()=>{
		var adrecruit = new Date().getFullYear() - users_plates['426052055589978112'].drecruit.match(/(?![0-9]{2}\/[0-9]{2}\/)[0-9]{4}/g).toString();
		console.log("sent best wishes anniversary xevery ("+adrecruit+" years) on "+new Date());
		client.channels.cache.get(id_general_channel).send("@everyone\n\n:birthday: Buon anniversario di "+adrecruit+" anni nel T.I.M.W <@"+xevery_id+">! :birthday:");
	});
})

client.on('message', async message => {try{
//	if(message.content == p+'provaprovetta'){
//		var adrecruit = new Date().getFullYear() - users_plates['426052055589978112'].drecruit.match(/(?![0-9]{2}\/[0-9]{2}\/)[0-9]{4}/g).toString();
//		console.log("sent best wishes anniversary xevery ("+adrecruit+" years) on "+new Date());
//		client.channels.cache.get(id_general_channel).send("@everyone\n\n:birthday: Buon anniversario di "+adrecruit+" anni nel T.I.M.W <@"+xevery_id+">! :birthday:");
//	}
	if(message.content == p+'status-verbose'){
		daily_msg = (await db.collection('others').doc('daily_msg').get()).data();
		users_plates = (await db.collection('others').doc('users_plates').get()).data();
		var ncards = 0;
		for(key in users_plates) ncards++;
		message.channel.send(`Daily message status: \`${(daily_msg.enabled == "false")?"off":"on"}\`\n`+
				     `Daily message channel: <#${daily_msg.channel.id}>\n`+
				     `Daily message time: \`${sched2time(daily_msg.time)}\`\n`+
				     `Daily covid-19 update time: \`${sched2time(daily_msg.time_covid)}\`\n`+
				     `Daily message: \`\`\`${daily_msg.messaggio}\n\`\`\``+
				     `User with cards (\`/card list\`): \`${ncards}\`\n`+
				     `Prefix: \`${p}\`\n`
		);
	}
	if(message.content == p+'status'){
		daily_msg = (await db.collection('others').doc('daily_msg').get()).data();
		users_plates = (await db.collection('others').doc('users_plates').get()).data();
		var ncards = 0;
		for(key in users_plates) ncards++;
		message.channel.send(`Daily message status: \`${(daily_msg.enabled == "false")?"off":"on"}\`\n`+
				     `User with cards (\`/card list\`): \`${ncards}\`\n`+
				     `Prefix: \`${p}\`\n`
		);
	}
	if(message.content.startsWith(p+'edit-mission ')){
		if(check_perms(message,'a')){
			m = shlex.split(message.content);
			message.delete().then(msg => {var d = Date(); console.log(`Deleted /edit-mission message from ${msg.author.username} at ${d}`)}).catch(console.error);
			//console.log(m);
			game = m[1];
			new_mission = m[2];
			if(!game||!new_mission)	message.channel.send('Incorrect usage.')
			channel_missions_id = id_missions_channel; //(await db.collection('missions_files').doc('missions').get()).data().channel_id; //dunno why i used firebase here
			id_missions = (await db.collection('missions_files').doc('missions').get()).data().id;
			old_msg = await client.channels.cache.get(channel_missions_id).messages.fetch(id_missions);
			new_msg = old_msg.content.split('\n');
			//console.log(m,new_msg);
			//console.log(m,new_msg[7]);
			cur_mis = new_msg.find(t => t.includes(game));
			cur_mis_split = cur_mis.split('**');
			//console.log(cur_mis_split);
			if(new_mission == 's/'){
				sub_split = m.slice(3);
				//console.log(sub_split);
				//console.log(cur_mis_split[4]);
				cur_mis_split[4] = cur_mis_split[4].replace(sub_split[0],sub_split[1]);
				//console.log(cur_mis_split[4]);
			}else{
				cur_mis_split[4] = ' '+new_mission+' ';
			}
			//console.log(cur_mis_split[4]);
			new_msg[new_msg.indexOf(cur_mis)] = cur_mis_split.join('**');
			//console.log(cur_mis_split);
			new_msg = new_msg.join('\n');
			fin_new_mis = (new_mission == 's/')?(new_mission+"\nto_sub:"+sub_split[0]+"\nsub_with:"+sub_split[1]):new_mission;
			//console.log(new_msg);
			//console.log('Edited mission message:\nGame:'+game+'\nnew_mission:'+fin_new_mis+'\nold_mission:'+cur_mis.split('**')[4].trim())
			old_msg.edit(new_msg).then(msg => console.log('Edited mission message:\nGame:'+game+'\nnew_mission:'+fin_new_mis+'\nold_mission:'+cur_mis.split('**')[4].trim())).catch(console.error);
		}
	}
	if(message.content.startsWith(p+'move')){
		cur_msg = message;
		message.delete().then(msg => {var d = Date(); console.log(`Deleted /move message from ${msg.author.username} at ${d}`)}).catch(console.error);
		//if((cur_msg.guild && (cur_msg.member.roles.cache.get(role_econ_moderator) || cur_msg.member.roles.cache.get(role_capo_clan) || cur_msg.member.roles.cache.get(role_admin) || cur_msg.member.roles.cache.get(role_bot) || cur_msg.member.roles.cache.get(role_moderator))) || (cur_msg.channel.type == 'dm' && (cur_msg.author.id == koray_id || cur_msg.author.id == triccotricco_id || cur_msg.author.id == lux_id || message.author.id == xevery_id))){
		if(check_perms(cur_msg,'a')){
			m_split = cur_msg.content.split(' ');
			cur_guild = cur_msg.guild;
			if(cur_msg.mentions.members.first()){
				ment = (await cur_msg.mentions.members.first());
				console.log(ment.user.tag);
			}else if(m_split[1]){
				if(m_split[1].trim().match('[0-9]{18}')){
					ment = (await cur_guild.members.resolve(m_split[1].trim()));
					console.log(ment.user.tag);
				}else{
					cur_msg.author.send("Couldn't find the user. @mention it or use the id");
					return;
				}
			}else if(!m_split[1]){
				cur_msg.author.send("No user specified. @mention it or use the id");
				return;
			}
			ment = ment.voice;
			cur_channel = ment.channel;
			afk_channel = cur_guild.afkChannel;
			for(move_int=0;move_int < 5;move_int++){
				console.log('/move cyle n:'+move_int);
				await ment.setChannel(afk_channel);
				await ment.setChannel(cur_channel);
			}
			console.log("/move finished");
		}else{
			cur_msg.author.send("You can't use this command");
		}
	}
	//if(message.content == '////prova'){
	//	//(await client.users.fetch(koray_id)).send('ciao');
	//	//console.log((await client.users.fetch(triccotricco_id)).tag);
	//	//(await client.users.fetch(triccotricco_id)).send("ciao");
	//	//(await client.users.fetch(triccotricco_id)).send("miao");
	//	// console.log(missions_file);
	//	/*var audit_array;
	//	message.guild.fetchAuditLogs().then(audit => {
	//		console.log(audit.entries.filter(entry => entry.action == 'MEMBER_UPDATE' && entry.target.id == koray_id).last().createdAt);
	//	}).catch(console.error);*/
	//	// console.log(ciaosososos);
	//}
	if(message.content.startsWith(p+'scheda') || message.content.startsWith(p+'card'))
	{
		users_plates = (await db.collection('others').doc('users_plates').get()).data();
		var lista = '>>> ';
		if(message.content == '/scheda list' || message.content == '/card list'){
			for(key in users_plates)
			{
				lista += `- **${(await client.users.fetch(key)).tag}**\n`;
			}
			message.channel.send(lista);
		}
		else
		{
			var mentioned_user = message.mentions.members.first();
			if(!mentioned_user){
				message.channel.send("Invalid user.\nUse `/help` to see a list of all the avaiable commands.");
			}
			else
			{
				Master_Role = mentioned_user.roles.highest;
				Squad_Role = mentioned_user.roles.cache.find(role => role.name.match(/TIMW-/g));
				Level_Role = mentioned_user.roles.cache.find(role => role.name.match(/[A-Z]+\s*\|\sLEGGENDA\s*\[[0-9]+-[0-9]+\]/g));
				if(!Master_Role){
					Master_Role = {"name":'N/A'};
				}
				if(!Squad_Role){
					Squad_Role = {"name":'N/A'};
				}
				if(!Level_Role){
					Level_Role = {"name":'N/A'};
				}
				if(!users_plates[mentioned_user.id])
				{
					message.channel.send(mentioned_user.user.tag+" doesn't have a player card.");
				}
				else
				{
					message.channel.send(`-**SCHEDA GIOCATORE**: *${users_plates[mentioned_user.id].name}*\n\n`
										+`-**RUOLO**: *${Master_Role.name}*\n`
										+`-**LIVELLO**: *${Level_Role.name.slice(0,5).trim()}*\n`
										+`-**ALLENATORE**: *${users_plates[mentioned_user.id].trainer}*\n`
										+`-**SQUADRE**: *${Squad_Role.name}*\n`
										+`-**STATO**: *${users_plates[mentioned_user.id].state}*\n`
										+`-**DATA DI RECLUTAMENTO**: *${users_plates[mentioned_user.id].drecruit}*\n`
										+`-**ARMA PREFERITA**: *${users_plates[mentioned_user.id].fav_gun}*\n`
										+`-**GIOCO PREFERITO**: *${users_plates[mentioned_user.id].fav_cod}*\n`
										+`-**KILLSTREAK PIU' ALTA**: *${users_plates[mentioned_user.id].hkstreak}*\n`
										).catch(console.error);
					console.log(mentioned_user.user.tag+" ("+mentioned_user.nickname+") scheda in "+message.channel.name+" by "+message.author.tag);
				}
			}
		}

	}
	if(message.content == p+'cit' || message.content == p+'CIT' || message.content == p+'Cit' || message.content == p+'quote' || message.content == p+'QUOTE' || message.content == p+'Quote' || message.content == p+'citazione' || message.content == p+'CITAZIONE' || message.content == p+'Citazione')
	{
		const citazioni = ["Galassie", "Pianeti", "It's time of T.I.M.Warfare"/*, "", "", "", ""*/];
		var numero = Math.floor(Math.random() * 3);
		var citt = citazioni[numero];
		message.channel.send(citt);
		console.log(`sent citazione nr: ${numero}, citazione: ${citt}`);
	}
	if((message.content.match(/\b[^0-9]*69[^0-9]*\b/) || message.content.match(/\b[^0-9]*420[^0-9]*\b/)) && message.content.length < 5){
		message.channel.send("Nice");
	}
	if((message.content.match(/\b[^0-9]*69420[^0-9]*\b/) || message.content.match(/\b[^0-9]*42069[^0-9]*\b/)) && message.content.length < 10){
		message.channel.send("**Noice**");
	}
	if(message.mentions.users.find(u=>u.id == bot_id) || (message.channel.type == 'dm' && message.author.id != bot_id))
	{
		m = message.content.split(/\s+/);
		regex_foreach = new RegExp('<(@!|@)'+bot_id+'>');
		m.forEach((e,i,ar)=>{if(e.match(regex_foreach)) {ar.splice(i,1);console.log(ar)}});
		console.log("pop:"+m[0]);
		part = m[0].trim();
		min_len = 1;
		//if(message.channel.type == 'dm') min_len = 1;
		//else min_len = 1;
		//console.log(message.channel.type,min_len,m.length);
		//thanking
		if((/grz/i).test(m) && m.length >= min_len){
			a=["Di nulla","Prego","Di niente","Nessun problema"];
			r=rn(a)+((Math.floor(Math.random()*15)==Math.floor(Math.random()*10))?" (Anche se si scrive 'grazie')":''); //1 volta ogni 25 'grz' aka 4% di probabilità
			message.reply(r);
			console.log("'"+message.content+"' from "+message.author.id+"; grz ans: '"+r+"'");
		}
		else if((/grazie/i).test(m) && m.length >= min_len){
			a=["Di nulla","Prego","Di niente","Nessun problema"];
			r=rn(a);
			message.reply(r);
			console.log("'"+message.content+"' from "+message.author.id+"; grazie ans: '"+r+"'");
		}else if((/thank/i).test(m) && m.length >= min_len){
			a=["No problem","You're welcome"];
			r=rn(a);
			message.reply(r);
			console.log("'"+message.content+"' from "+message.author.id+"; thank ans: '"+r+"'");
		}else if((/ty|thx/i).test(m) && m.length >= min_len){
			message.reply('np');
			console.log("'"+message.content+"' from "+message.author.id+"; tythx ans: 'np'");
		}
		//thanking is no more
		else if((/ciao|^h(ey|i)$|he(ll|l)o/i).test(m) && min_len == min_len){
			if(m.length == min_len)
			{
				if((/ciao/i).test(m)){
					message.channel.send("Ciao "+message.author.username);
					console.log("sent 'Ciao "+message.author.username+"'");
				}else if((/^h(ey|i)$|he(ll|l)o/i).test(m)){
					message.channel.send("Hello "+message.author.username);
					console.log("sent 'Hello "+message.author.username+"'");
				}
			}

		}
		//*calculating intensifies*
		else if(part.match(/calc|quanto/i) && m.length >= min_len){
			if(m.length == min_len){
				message.channel.send("Devi scrivere un calcolo o un'espressione da farmi fare.\n"
									+"Vedi https://mathjs.org/docs/expressions/syntax.html#operators e https://mathjs.org/docs/expressions/syntax.html#precedence.\n"
									+"**Nota**: le conversioni non funzionano ancora e quindi daranno un risultato sbagliato.");
			}else{
				if(part.match(/quanto/i)){
					m=m.slice(min_len+1).join('');
				}
				else if(part.match(/calc/i)){
					m=m.slice(min_len).join('');
				}
				res=mjs.evaluate(m).toString();
				message.channel.send(res);
				console.log("m="+m+"\nres="+res+"\nfrom:"+message.author.tag+"("+message.author.id+")");
			}
		}
		//insult/compliment
		//to fix with machine learning//else{
		//to fix with machine learning//	/* const list_ins_comp = {"insults": [/figlio d(e|i) put/, "scem", "bastard", "coglion", "testa di cazzo", "lurid", "lurido schifos", "inutil", "porc", "nan", /str(o|u)nz/], "compliments": ["brav", "intelligent", "bell", "util"]};
		//to fix with machine learning//	const risposte = {"insults": ["Altrettano", "Tu sei un coglione", "Tu sei un coglione", "Tu sei uno scemo", "Tu sei un bastardo", "Tu sei un figlio di... brava donna", "Tu sei uno scemo", "Vaffanculo", "A bucchin a mammt"], "compliments": ["Altrettano", "Tu sei bravo", "Tu sei intelligente", "Tu sei bello", "Tu sei utile", ":) Grazie", ":) Grazie Mille", "Molte Grazie :)", "Thank you", "ty"]}; */
		//to fix with machine learning//	const list_ins_comp = (await db.collection('others').doc('inputs').get()).data();
		//to fix with machine learning//	const risposte = (await db.collection('others').doc('answers').get()).data();
		//to fix with machine learning//	insult = false;
		//to fix with machine learning//	complim = false;
		//to fix with machine learning//	risp = 0;
		//to fix with machine learning//	
		//to fix with machine learning//	/* console.log(m[j]);
		//to fix with machine learning//			console.log("-1: "+m[j-1]); */

		//to fix with machine learning//	for(i in list_ins_comp.insults){
		//to fix with machine learning//		for(j in m){
		//to fix with machine learning//			if(m[j].match(new RegExp(list_ins_comp.insults[i]),'i')){
		//to fix with machine learning//				insult = true;
		//to fix with machine learning//				console.log("j:"+m[j]+";"+new RegExp(list_ins_comp.insults[i]));
		//to fix with machine learning//				//m[j].match(new RegExp(list_ins_comp.insults[i]),'i')
		//to fix with machine learning//			}
		//to fix with machine learning//		}
		//to fix with machine learning//	}
		//to fix with machine learning//	for(i in list_ins_comp.compliments){
		//to fix with machine learning//		for(j in m){
		//to fix with machine learning//			if(m[j].match(new RegExp(list_ins_comp.compliments[i],'i'))){
		//to fix with machine learning//				complim = true;
		//to fix with machine learning//				//m[j].match(new RegExp(list_ins_comp.compliments[i],'i'))
		//to fix with machine learning//			}
		//to fix with machine learning//		}
		//to fix with machine learning//	}
		//to fix with machine learning//	if(insult){risp = risposte.insults[Math.floor(Math.random() * risposte.insults.length)]};
		//to fix with machine learning//	if(complim){risp = risposte.compliments[Math.floor(Math.random() * risposte.compliments.length)]};
		//to fix with machine learning//	// console.log(risp);
		//to fix with machine learning//	if(risp != 0)message.channel.send(risp);
		//to fix with machine learning//	console.log("'"+message.content+"' from "+message.author.id+"; ins/comp ans: '"+risp+"'");
		//to fix with machine learning//}
	}
	if(message.content.startsWith(p+'set daily message'))
	{
		if(check_perms(message,'a'))
		{
			var isValid = 1;
			var new_daily_msg;
			var new_daily_msg_time;
			var new_daily_msg_new_time;
			var new_daily_msg_trm;
			new_daily_msg = message.content.split(':');
			if(!new_daily_msg[1])
			{
				message.channel.send('Please input a valid message/time. To stop the daily message type: /set daily message: off');
			}
			else if(new_daily_msg[0].startsWith("/set daily message channel"))
			{
				new_daily_msg_new_channel = message.mentions.channels.first();
			/* 	console.log(new_daily_msg_new_channel.id);
				console.log(new_daily_msg_new_channel.name);
				console.log(new_daily_msg_new_channel.type);
				console.log(new_daily_msg_new_channel.guild.id); */
				daily_msg.channel.id 		= new_daily_msg_new_channel.id;
				daily_msg.channel.name 		= new_daily_msg_new_channel.name;
				daily_msg.channel.type 		= new_daily_msg_new_channel.type;
				daily_msg.channel.guild.id 	= new_daily_msg_new_channel.guild.id;

				sdm(daily_msg);
				message.channel.send(`The daily message will now be sent in <#${new_daily_msg_new_channel.id}>`);
			}
			else if(new_daily_msg[0].startsWith("/set daily message time"))
			{
				new_daily_msg_time = new_daily_msg[1].trim();
				new_daily_msg_new_time = new_daily_msg_time.split('.');
				var hours_msg = new_daily_msg_new_time[0].trim();
				var minute_msg = new_daily_msg_new_time[1].trim();
				var seconds_msg = new_daily_msg_new_time[2].trim();
				if(hours_msg > 23)
				{
					message.channel.send("Please enter a valid hour.");
					isValid = 0;
				}
				if(minute_msg > 59)
				{
					message.channel.send("Please enter a valid minute.");
					isValid = 0;
				}
				if(seconds_msg > 59)
				{
					message.channel.send("Please enter a valid second.");
					isValid = 0;
				}
				// 12.02.06 = 06 02 12 * * *
				var daily_msg_timer = `${seconds_msg} ${minute_msg} ${hours_msg} * * *`;
				daily_msg.time = daily_msg_timer;
				console.log(daily_msg_timer);
				if(isValid == 1)
				{
					sdm(daily_msg);
					if(hours_msg < 12)
					{
						message.channel.send(`The daily message will now be sent everyday at ${hours_msg}am, ${minute_msg} minutes and ${seconds_msg} seconds.`);
					}
					else
					{
						message.channel.send(`The daily message will now be sent everyday at ${hours_msg}pm, ${minute_msg} minutes and ${seconds_msg} seconds.`);
					}
				}
			}
			else if(new_daily_msg[1].trim() == "off")
			{
				daily_msg.enabled = "false";
				sdm(daily_msg);
				console.log(daily_msg.enabled);
				message.channel.send('The daily message is now off. To put it back on type: /set daily message: on');
			}
			else if(new_daily_msg[1].trim() == "on")
			{
				daily_msg.enabled = "true";
				sdm(daily_msg);
				console.log(daily_msg.enabled);
				message.channel.send('The daily message is now on. To put it off type: /set daily message: off');
			}
			else
			{
				new_daily_msg_trm = new_daily_msg[1].trim();
				daily_msg.messaggio = new_daily_msg_trm;
				console.log(new_daily_msg);
				sdm(daily_msg);
				message.channel.send(`The new daily message is:\n${new_daily_msg_trm.replace(/\\n/g, '\n')}`);
			}
		}
		else if(message.guild)
		{
			message.channel.send("Seems like you can't use this command.");
		}
		else
		{
			message.author.send("Couldn't retrieve roles, type the command in the T.I.M.Warfare server.");
		}
	}
	if(message.content.startsWith(p+'clear-byid-'))
	{
		if(check_perms(message,'a'))
		{
			var cont = message.content.split('-').slice(2);
			var cm = message;
			console.log("clear byid: "+cont+" by "+cm.author.tag);
			cm.delete().then(msg => {var d = Date(); console.log(`Deleted message from ${msg.author.username} at ${d}`)}).catch(console.error);
			for(i=0;i<cont.length;i++){
				var id = cont[i];
				/* msg = await (await message.channel.messages.fetch(id)).delete();
				msg2 = await message.delete();
				var d = new Date();
				console.log(`del clear-byid msg of ${msg.author.username} at ${d} by ${message.author.tag}`);
				console.log(`del msg from ${msg2.author.username} at Y:${d.getFullYear()} m:${d.getMonth()} d:${d.getDay()} - H:${d.getHours()} M:${d.getMinutes()} S:${d.getSeconds()}`); */

				deleted = false
				chan_cache = await message.guild.channels.cache;
				//for([k,v] of chan_cache) console.log("aaa:"+k,v);
				for([idc,chan] of chan_cache){
					try{
						process.stdout.write(".");
						//process.stdout.write(chan.name);
						mes_clear = await chan.messages.fetch(id);
						console.log(mes_clear.id+"-"+mes_clear.content);
						dd = await mes_clear.delete()
						if(dd){
							var d = Date();
							console.log(`Deleted clear-byid message from ${dd.author.username} at ${d} by ${cm.author.tag}`)
							deleted = true;
							break;
						}
					}catch(e){/*console.log(e)*/}
				}
				console.log(`\ndeld for ${id}:`+deleted);
				if(deleted != true) cm.author.send(`Didn't find message with id:\`${id}\`. It's either been already deleted or it's never existed.`);
			}
		}
	}
	if(message.content.startsWith(p+'trova-user-'))
	{
		var cont = message.content.split('-').slice(2);
		console.log("trova users: "+cont+" by "+message.author.tag);
		for(i=0;i<cont.length;i++){
			var id = cont[i];
			if((await client.users.fetch(id)) != undefined)
			{
				var user = (await client.users.fetch(id));
				var member = (message.guild) ? await client.guilds.cache.get(message.guild.id).members.fetch(id) : "not in a server";
				var cc = `**${id}:**\n__name#tag:__ ${user.tag}\n__name:__ ${user.username}\n__nickname in this server:__ ${(member.nickname)?member.nickname:"none"}`;
				// console.log(cc);
				message.channel.send(cc);
			}
			else
			{
				message.channel.send(`**${id}**:\nDidn't find the user`);
			}
		}
	}
	if(message.content == p+'help')
	{
		message.channel.send(">>> **Commands**\n\n"
							+"`/cit` OR `/citazione` OR `/quote`"
							+"\n*- Sends a quote of the T.I.M.Warfare Clan.*\n\n"

							+"`/inv` OR `/inventory`\n"
							+"*- Shows your inventory.*\n\n"

							+"`/inv [user mention]` OR `/inventory [user mention]`\n"
							+"*- Shows the inventory of the mentioned user.*\n\n"

							+"`/open crate`\n"
							+"*- Opens 1 crate.*\n\n"

							+"`/poll poll message;element1,element2,...`\n"
							+"*- Creates a poll (like the one in <#437961671018020864>).*\n\n"

							+"`/card [user mention]` OR `/scheda [user mention]`\n"
							+"*- Shows mentioned user's player card.*\n\n"

							+"`/card list` OR `/scheda list`\n"
							+"*- Shows the list of the users who have a player card.*\n\n"

							+"`/status`\n"
							+"*- Shows some summary informations.*\n\n"
							);
							//\n\n`/scheda @User`\n*- Visualizza la scheda di @User.*\n\n`/scheda list`\n*- Visualizza l'elenco degli utenti che hanno una scheda giocatore.*
	}
	if(message.content == p+'hjelp')
	{
		if(check_perms(message,'a'))
		{
			message.author.send(">>> **Commands**\n"
								+"`/trova-user-['-' separaterd ids]`\n"
								+"*- Returns the name#tag, the name and the nickname of the user(s) with [id]*\n"
								+"`/clear-byid-['-' separaterd ids]`\n"
								+"*- Deletes the message(s) with [id]*\n"
								+"`/move [@mention|id]`"
								+"*- Moves 8 times the mentioned user (or the user with the specified id) in and out of the afk channel*\n"
								+"`/edit-mission [game] [new mission]` OR `/edit-mission [game] s/ [pattern to subtitute] [subtitute with]`\n"
								+"*- Change current mission for `game`*\n"
								+"`/cit` OR `/citazione` OR `/quote`\n"
								+"*- Sends a quote of the T.I.M.Warfare Clan.*\n"
								+"`/inv` OR `/inventory`\n"
								+"*- shows your inventory.*\n"
								+"`/insvs`\n"
								+"*- show every inventory*\n"
								+"`/inv [user mention]` OR `/inventory [user mention]`\n"
								+"*- shows the inventory of the mentioned user.*\n"
								+"`/give crate [user mention]`\n"
								+"*- Give 1 crate to the tagged user.*\n"
								+"`/remove crate [user mention]`\n"
								+"*- Removes 1 crate from a user's inventory.*\n"
								+"`/open crate`\n"
								+"*- Opens 1 crate.*\n"
								+"`/set daily message: [message]`\n"
								+"*- Sets the content of the daily message.\n[message] has to be typed on ****1 line**** with ****\\n**** to insert a return. Can be formatted as a normal discord message (https://support.discordapp.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline, https://gist.github.com/matthewzring/9f7bbfd102003963f9be7dbcf7d40e51)*\n"
								+"`/set daily message: off`\n"
								+"*- Stops the daily message.*\n"
								+"`/set daily message: on`\n"
								+"*- Starts the daily message.*\n"
								+"`/set daily message time: [hours.minutes.seconds]`\n"
								+"*- Sets the time of the daily message.*\n"
								+"`/set daily message channel: #channel_name`\n"
								+"*- Sets the channel in which the daily message will be sent.*\n"
								+"`/poll poll message;element1,element2,...`\n"
								+"*- Creates a poll (like the one in <#437961671018020864>).*\n"
								+"`/card [user mention]` OR `/scheda [user mention]`\n"
								+"*- Shows mentioned user's player card.*\n"
								+"`/card list` OR `/scheda list`\n"
								+"*- Shows the list of the users who have a player card.*\n"
								+"`/status`\n"
								+"*- Shows some summary informations.*\n"
								+"`/status-verbose`\n"
								+"*- Shows more summary informations.*\n"
								).catch(console.error);
			message.delete().then(msg => {var d = Date(); console.log(`Deleted hjelp message from ${msg.author.username} at ${d}`)}).catch(console.error);
		}
	}
	if(message.content.startsWith(p+'give crate'))
	{
		//if((message.guild && (message.member.roles.cache.get(role_econ_moderator) || message.member.roles.cache.get(role_capo_clan) || message.member.roles.cache.get(role_admin) || message.member.roles.cache.get(role_bot) || message.member.roles.cache.get(role_moderator))) || (message.channel.type == 'dm' && (message.author.id == koray_id || message.author.id == triccotricco_id || message.author.id == lux_id || message.author.id == xevery_id)))
		//if((message.guild && (message.member.roles.cache.get(role_econ_moderator) || message.member.roles.cache.get(role_capo_clan) || message.member.roles.cache.get(role_admin) || message.member.roles.cache.get(role_bot) || message.member.roles.cache.get(role_moderator))))
		if(check_perms(message,'g'))
		{
			if(!message.mentions.users.first()){
				message.channel.send("Please tag a valid user.");
			}else{
				give_crates(message.mentions.users.first().id,message.mentions.users.first().tag);
			}
		}
		else if(message.guild)
		{
			message.channel.send("Seems like you can't use this command.");
		}
		else
		{
			message.author.send("Couldn't retrieve roles, be sure to type the command in a server.");
		}
	}
	if(message.content.startsWith(p+'remove crate'))
	{
		//if((message.guild && (message.member.roles.cache.get(role_econ_moderator) || message.member.roles.cache.get(role_capo_clan) || message.member.roles.cache.get(role_admin) || message.member.roles.cache.get(role_bot) || message.member.roles.cache.get(role_moderator))) || (message.channel.type == 'dm' && (message.author.id == koray_id || message.author.id == triccotricco_id || message.author.id == lux_id || message.author.id == xevery_id)))
		//if((message.guild && (message.member.roles.cache.get(role_econ_moderator) || message.member.roles.cache.get(role_capo_clan) || message.member.roles.cache.get(role_admin) || message.member.roles.cache.get(role_bot) || message.member.roles.cache.get(role_moderator))))
		if(check_perms(message,'g'))
		{
			var usertoremove = message.mentions.users.first().id;
			remove_crates(usertoremove);
		}
		else if(message.guild){
			message.channel.send("Seems like you can't use this command.");
		}else{
			message.author.send("Couldn't retrieve roles, type the command in the T.I.M.Warfare server.");
		}
	}
	if(message.content === p+'insvs')
	{
		if(check_perms(message,'a'))
		{
			const users = await guc();
			for(x in users.lista_users)
			{
				if(users.lista_users[x].crates <= 0)
				{
					continue;
				}
				else
				{
					message.channel.send(`**${users.lista_users[x].name}** has ${users.lista_users[x].crates} crates`).catch(console.error);
				}
			}
			message.channel.send('everyone else has 0 crates');
		}
		else
		{
			message.author.send("Couldn't retrieve roles, type the command in the T.I.M.Warfare server.");
		}
	}
	if(message.content.startsWith(p+'inv') || message.content.startsWith(p+'inventory'))
	{
		menzioni = message.mentions.users.first();
		// console.log(menzioni);
		if(menzioni == undefined)
		{
			const users = await guc();
			var crate_number, y, isValid = 0;
			const id_user = message.author.id;
			console.log(id_user);

			for(y in users.lista_users)
			{
				if(users.lista_users[y].id == id_user)
				{
					crate_number = users.lista_users[y].crates;
					console.log(crate_number);
					if(crate_number <= 0 || crate_number == undefined)
					{
						console.log(users.lista_users[y].crates);
						message.reply(`you have no crates.`);
						isValid = 1;
					}
					break;
				}
				else
				{
					continue;
				}
			}
			if(isValid != 1)
			{
				if(crate_number <= 0 || crate_number == undefined)
				{
					console.log(users.lista_users[y].crates);
					message.reply(`you have no crates.`);
					isValid = 1;
				}
				else
				{
					(crate_number == 1) ? cras = "crate" : cras = "crates";
					message.reply(`you have ${crate_number} ${crate_name} ${cras}.\nType "/open crate" to open one or "/help" to see the command list.`);
				}
			}
		}
		else
		{
			const users = await guc();
			var crate_number, y, isValid = 0;
			const user_menzionato = message.mentions.users.first();
			console.log(user_menzionato);
			const id_user = user_menzionato.id;
			console.log(id_user);

			for(y in users.lista_users)
			{
				if(users.lista_users[y].id == id_user)
				{
					crate_number = users.lista_users[y].crates;
					console.log(crate_number);
					if(crate_number <= 0 || crate_number == undefined)
					{
						console.log(users.lista_users[y].crates);
						message.channel.send(`${user_menzionato} has no crates.`);
						isValid = 1;
					}
					break;
				}
				else{
					continue;
				}
			}
			if(isValid != 1)
			{
				if(user_menzionato.tag == undefined){
					message.channel.send("a");
				}
				else if(crate_number <= 0 || crate_number == undefined)
				{
					console.log(users.lista_users[y].crates);
					message.channel.send(`${user_menzionato} has no crates.`);
					isValid = 1;
				}else{
					(crate_number == 1) ? cras = "crate" : cras = "crates";
					message.channel.send(`${user_menzionato} has ${crate_number} ${crate_name} ${cras}.`);
				}
			}
		}
	}
	if(message.content == p+'open crate')
	{
		var contenuto_crate = crate.blackeden[Math.floor(Math.random() * (crate.blackeden.length - 1))]
		console.log(contenuto_crate);

		var minus = await remove_crates(message.author.id);
		if(minus != 0)
		{
			message.channel.send({embed: contenuto_crate}).catch(console.error);

			(await client.users.fetch(koray_id)).send({embed: contenuto_crate}).catch(console.error);
			(await client.users.fetch(triccotricco_id)).send({embed: contenuto_crate}).catch(console.error);
			(await client.users.fetch(xevery_id)).send({embed: contenuto_crate}).catch(console.error);
			(await client.users.fetch(lux_id)).send({embed: contenuto_crate}).catch(console.error);
			(await client.users.fetch(koray2ndaccount_id)).send({embed: contenuto_crate}).catch(console.error);
			//
			(await client.users.fetch(koray_id)).send(`a <@${message.author.id}>`).catch(console.error);
			(await client.users.fetch(triccotricco_id)).send(`a <@${message.author.id}>`).catch(console.error);
			(await client.users.fetch(lux_id)).send(`a <@${message.author.id}>`).catch(console.error);
			(await client.users.fetch(koray2ndaccount_id)).send(`a <@${message.author.id}>`).catch(console.error);
			(await client.users.fetch(xevery_id)).send(`a <@${message.author.id}>`).catch(console.error);
		}
		else
		{
			message.reply("you don't have any crate");
		}
	}
	if(message.content.startsWith(p+'poll'))
	{
		var poll_entries;
		data_pl = message.createdAt;
		nonce_pl = message.nonce;
		author_ = message.author.id;
		console.log(data_pl + " data");
		console.log(author_ + " id_author");
		author_ = message.author;
		var msgcontent = message.content.slice(5);
		var msgcontent = msgcontent.trim();
		var poll_array_entries = msgcontent.split(";");
		var uno = poll_array_entries[1];
		console.log(msgcontent);
		if(!msgcontent || !poll_array_entries[1])
		{
			message.channel.send("Please type a valid poll. Use `/help` for the list of commands and syntaxes.");
			//message.channel.send("Please type a valid poll.\n**Syntax**: \`\`\`/poll poll message;element1,element2,...\`\`\`");
		}
		else
		{
			poll_entries = uno.split(",");
			var i;
			for(i = 0; i < poll_entries.length; i++ )
			{
				if(!lettere[i]) break;
				var giochi = ((giochi)?giochi+"\n\n":"") + lettere[i] + " " + poll_entries[i];
			}
			var msg_ = ">>> " + "**" + poll_array_entries[0] + "**" + "\n\n" + giochi;
			msg_poll = await message.channel.send(msg_);
			if(msg_poll.author.id == bot_id && msg_poll.content.startsWith(">>> **"))
			{
				for(i = 0; i < poll_entries.length; i++){
					await msg_poll.react(emojis[i]).catch(console.error);
				}
			}
		}
	}
	if(message.content.startsWith(p+'poll Prossimi giochi per le missioni (le missioni saranno sui 4 giochi più votati);'))
	{
		message.delete().then(msg => {var d = Date(); console.log(`Deleted message poll missions from ${msg.author.username} at ${d}`)}).catch(console.error);
	}
	if(message.author.id == bot_id && message.content.startsWith(">>> **Prossimi giochi per le missioni (le missioni saranno sui 4 giochi più votati"))
	{
		db.collection('missions_files').doc('poll').set({id: message.id}).catch(console.error);
		console.log("scritto poll: "+message.id);
	}
	if(message.content.startsWith("@everyone\n\n-------------**| WEEKLY MISSIONS |**-------------\n\n\n*-OPEN MISSIONS-*\n\n**[** @everyone **]** ") && (message.author.id === bot_id || message.author.id === koray_id))
	{
		db.collection('missions_files').doc('missions').set({id: message.id});
		console.log("scritto_missioni: "+message.id);
	}
	if(message.content == 'poll_missions_send' && (message.author.id === bot_id || message.author.id === koray_id)){
		missions_file = order_obj((await db.collection('missions_files').doc('missions_file').get()).data());
		for(let missioni_gioco in missions_file)
		{
			var giochi_poll = ((giochi_poll)?giochi_poll:"")+missioni_gioco+",";
		}
		client.channels.cache.get(id_missions_channel).send(p+'poll Prossimi giochi per le missioni (le missioni saranno sui 4 giochi più votati);'+giochi_poll.substr(0,giochi_poll.length-1));
		console.log(`sent poll at ${Date()}`);
		(await client.users.fetch(koray_id)).send(`sent poll at ${Date()}`);
		message.delete().then(msg => {var d = Date(); console.log(`Deleted message from ${msg.author.username} at ${d}`)}).catch(console.error);
	}
	//retrieve giochi missioni
	if(message.content === 'missions_activate_now' && (message.author.id === bot_id || message.author.id === koray_id) && send_missions == true)
	{
		send_missions = false;
		missions_file = order_obj((await db.collection('missions_files').doc('missions_file').get()).data());
		message.delete().then(msg => {var d = Date(); console.log(`Deleted message from ${msg.author.username} at ${d}`)}).catch(console.error);
		id_poll = (await db.collection('missions_files').doc('poll').get()).data().id;

		// setTimeout(()=>{
		poll_msg = await message.channel.messages.fetch(id_poll)
		const reactions_map = poll_msg.reactions.cache.map(reaction => reaction.count);//forEach(reaction_obj => console.log(reaction_obj.count));
		const msg_content = poll_msg.content.split('\n');
		// console.log(reactions_map);
		//console.log(msg_content);
		var gioco;
		var fl = 0;
		var array_votes = [];
		for(var ff = 0; ff < msg_content.length; ff++)
		{
			if(!msg_content[ff].includes(":regional_indicator"))
			{
				continue;
			}
			gioco = msg_content[ff].replace(lettere[fl]+" ", "");
			gioco = reactions_map[fl]+" - "+gioco;//+" - "+due[fl];
			array_votes.push(gioco);
			fl++;
			// console.log(gioco);
		}
		array_votes.sort();
		array_votes.reverse();
		console.log(array_votes);
		missions_choose(array_votes[0].substr(4), array_votes[1].substr(4), array_votes[2].substr(4), array_votes[3].substr(4), missions_file);
		console.log(array_votes[0].substr(4)+ "_" + array_votes[1].substr(4)+ "_" + array_votes[2].substr(4)+ "_" + array_votes[3].substr(4));
		//console.log(`\na\n${array_votes}\na\n`);
		// }, 100)
		/* }catch(error){
			console.error(error);
		} */

		// try{
			
		/* }catch(error){
			console.error(error);
		} */
		if(ok == true){
			setTimeout(()=>{ //delete last poll
				message.channel.messages.fetch(id_poll).then(message => message.delete().then(msg => {var d = new Date(); console.log(`del msg_poll (f: ${msg.author.username}) at Y:${d.getFullYear()} m:${d.getMonth()} d:${d.getDay()} - H:${d.getHours()} M:${d.getMinutes()} S:${d.getSeconds()}`)}).catch(console.error)).catch(console.error);
			}, 2000)
			id_missions = (await db.collection('missions_files').doc('missions').get()).data().id;
			setTimeout(()=>{ //delete last missions message
				message.channel.messages.fetch(id_missions).then(message => message.delete().then(msg => {var d = new Date(); console.log(`del msg_missions (f: ${msg.author.username}) at Y:${d.getFullYear()} m:${d.getMonth()} d:${d.getDay()} - H:${d.getHours()} M:${d.getMinutes()} S:${d.getSeconds()}`)}).catch(console.error)).catch(console.error);
			}, 3000)
			setTimeout(()=>{ //poll
				for(let missioni_gioco in missions_file)
				{
					var giochi_poll = ((giochi_poll)?giochi_poll:"")+missioni_gioco+",";
				}
				client.channels.cache.get(id_missions_channel).send(p+'poll Prossimi giochi per le missioni (le missioni saranno sui 4 giochi più votati);'+giochi_poll.substr(0,giochi_poll.length-1));
				console.log(`sent poll at ${Date()}`);
			}, 5000)
			setTimeout(async ()=>{ //avviso in #general
				client.channels.cache.get(id_general_channel).send('@everyone\n\n**NUOVE Missioni Settimanali disponibili!!**\n\nControlla il canale <#437961671018020864> per le sfide, completale per ottenere <:SHADOWSCURRENCY:412717479476068383> e vota per i giochi della prossima settimana.');
				console.log(`sent alert_missions at ${Date()}`);
				(await client.users.fetch(koray_id)).send("check <#437961671018020864>");
				send_missions = true;
			}, 10000)
		}
	}
}catch(error){console.log(error)}
})
//aa// // from https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/coding-guides/tracking-used-invites.md
//aa// // Initialize the invite cache
//aa// const invites = {};
//aa// // A pretty useful method to create a delay without blocking the whole script.
//aa// const wait = require('util').promisify(setTimeout);
//aa// client.on('ready', async () => {
//aa// 	// "ready" isn't really ready. We need to wait a spell.
//aa// 	await wait(1000);
//aa// 	
//aa// 	// Load all invites for all guilds and save them to the cache.
//aa// 	client.guilds.cache.forEach(g => {
//aa// 		g.fetchInvites().then(guildInvites => {
//aa// 			invites[g.id] = guildInvites;
//aa// 		});
//aa// 	});
//aa// });
//aa// client.on('guildMemberAdd', async member => {
//aa// 	console.log("add");
//aa// 	// To compare, we need to load the current invite list.
//aa// 	guildInvites = (await member.guild.fetchInvites())
//aa// 	// This is the *existing* invites for the guild.
//aa// 	const ei = invites[member.guild.id];
//aa// 	// Update the cached invites for the guild.
//aa// 	invites[member.guild.id] = guildInvites;
//aa// 	// Look through the invites, find the one for which the uses went up.
//aa// 	const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
//aa// 	// This is just to simplify the message being sent below (inviter doesn't have a tag property)
//aa// 	const inviter = client.users.fetch(invite.inviter.id);
//aa// 
//aa// 	logs_welcome = (await db.collection('others').doc('logs').get()).data().welcome;
//aa// 	logs_welcome[logs_welcome.length] = `@${member.user.tag} joined, invite code https://discord.gg/${invite.code} (${invite.uses} uses), by ${inviter.tag} - ${Date()}`;
//aa// 	db.collection('others').doc('logs').update({welcome:logs_welcome}).catch(console.error);
//aa// 	console.log("logs.welcome:"+logs_welcome[logs_welcome.length-1]);
//aa// });
// TODO:
// client.on('guildMemberRemove', async member => {
// 	console.log("add");
// 	// To compare, we need to load the current invite list.
// 	guildInvites = (await member.guild.fetchInvites())
// 	// This is the *existing* invites for the guild.
// 	const ei = invites[member.guild.id];
// 	// Update the cached invites for the guild.
// 	invites[member.guild.id] = guildInvites;
// 	// Look through the invites, find the one for which the uses went up.
// 	const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
// 	// This is just to simplify the message being sent below (inviter doesn't have a tag property)
// 	const inviter = client.users.get(invite.inviter.id);
// 
// 	logs_welcome = (await db.collection('others').doc('logs').get()).data().welcome;
// 	logs_welcome[logs_welcome.length] = `logs.welcome:${member.user.tag} joined, invite code ${invite.code} (${invite.uses} uses), by ${inviter.tag}. ${Date()}`;
// 	db.collection('others').doc('logs').update({welcome:logs_welcome}).catch(console.error);
// 	console.log(logs_welcome[logs_welcome.length-1]);
// });

tok = endec.decode(process.env.tok);
client.login(tok);



// deprecated:
/*async function missions_choose_old(gioco_uno, gioco_due, gioco_tre, gioco_quattro, ms_obj)
{
	var giocouno = "";
	var giocodue = "";
	var giocotre = "";
	var giocoquattro = "";

	var settemila = "";
	var ottomila = "";
	var novemila = "";
	var diecimila = "";

	var missioneuno = "";
	var missionedue = "";
	var missionetre = "";
	var missionequattro = "";

	giocouno = switch_game(gioco_uno,ms_obj);
	giocodue = switch_game(gioco_due,ms_obj);
	giocotre = switch_game(gioco_tre,ms_obj);
	giocoquattro = switch_game(gioco_quattro,ms_obj);
	//debug console.log(giocouno);	
	//debug console.log(giocodue);
	//debug console.log(giocotre);
	//debug console.log(giocoquattro);
	//debug console.log("whiles now");
	
	//check for reward duplicates

	//debug console.log(giocouno.substr(giocouno.length - 5));
	//ddebug console.log("while 1");
	// check prices (aka rewards)
	// 	for giocouno, if there is a missions with the same price then change it
	while(giocouno.substr(giocouno.length - 5) == giocodue.substr(giocodue.length - 5) || giocouno.substr(giocouno.length - 5) == giocotre.substr(giocotre.length - 5) || giocouno.substr(giocouno.length - 5) == giocoquattro.substr(giocoquattro.length - 5))
	{
		giocouno = switch_game(gioco_uno,ms_obj);
		//debug console.log(gioco_uno);
		//debug console.log("1"+giocouno);
	}
	//debug console.log(giocodue.substr(giocodue.length - 5));
	//ddebug console.log("while 2");
	while(giocodue.substr(giocodue.length - 5) == giocouno.substr(giocouno.length - 5) || giocodue.substr(giocodue.length - 5) == giocotre.substr(giocotre.length - 5) || giocodue.substr(giocodue.length - 5) == giocoquattro.substr(giocoquattro.length - 5))
	{
		giocodue = switch_game(gioco_due,ms_obj);
		//debug console.log(gioco_due);
		//debug console.log("2"+(giocodue.substr(giocodue.length - 5) == giocouno.substr(giocouno.length - 5) || giocodue.substr(giocodue.length - 5) == giocotre.substr(giocotre.length - 5) || giocodue.substr(giocodue.length - 5) == giocoquattro.substr(giocoquattro.length - 5)));
	}
	//debug console.log(giocotre.substr(giocotre.length - 5));	
	//ddebug console.log("while 3");
	while(giocotre.substr(giocotre.length - 5) == giocouno.substr(giocouno.length - 5) || giocotre.substr(giocotre.length - 5) == giocodue.substr(giocodue.length - 5) || giocotre.substr(giocotre.length - 5) == giocoquattro.substr(giocoquattro.length - 5))
	{
		giocotre = switch_game(gioco_tre,ms_obj);
		//debug console.log(gioco_tre);
		//debug console.log("3"+giocotre);
	}
	//debug console.log(giocoquattro.substr(giocoquattro.length - 5));
	//ddebug console.log("while 4");
	while(giocoquattro.substr(giocoquattro.length - 5) == giocouno.substr(giocouno.length - 5) || giocoquattro.substr(giocoquattro.length - 5) == giocodue.substr(giocodue.length - 5) || giocoquattro.substr(giocoquattro.length - 5) == giocotre.substr(giocotre.length - 5))
	{
		giocoquattro = switch_game(gioco_quattro,ms_obj);
		//debug console.log(gioco_quattro);
		//debug console.log("4"+giocoquattro);
	}
	//debug console.log(giocouno);	
	//debug console.log(giocodue);
	//debug console.log(giocotre);
	//debug console.log(giocoquattro);

	//assign game & reward
	switch(giocouno.substr(giocouno.length - 5))
	{
		case " 7000":
		settemila = giocouno.substr(0, giocouno.length - 5);
		break;

		case " 8000":
		ottomila = giocouno.substr(0, giocouno.length - 5);
		break;

		case " 9000":
		novemila = giocouno.substr(0, giocouno.length - 5);
		break;

		case "10000":
		diecimila = giocouno.substr(0, giocouno.length - 5);
		break;

		default:
		(await client.users.fetch(koray_id)).send("null_shadows_1");
	}
	//ddebug console.log("1");
	switch(giocodue.substr(giocodue.length - 5))
	{
		case " 7000":
		settemila = giocodue.substr(0, giocodue.length - 5);
		break;

		case " 8000":
		ottomila = giocodue.substr(0, giocodue.length - 5);
		break;

		case " 9000":
		novemila = giocodue.substr(0, giocodue.length - 5);
		break;

		case "10000":
		diecimila = giocodue.substr(0, giocodue.length - 5);
		break;

		default:
		(await client.users.fetch(koray_id)).send("null_shadows_2");
	}
	//ddebug console.log("2");
	switch(giocotre.substr(giocotre.length - 5))
	{
		case " 7000":
		settemila = giocotre.substr(0, giocotre.length - 5);
		break;

		case " 8000":
		ottomila = giocotre.substr(0, giocotre.length - 5);
		break;

		case " 9000":
		novemila = giocotre.substr(0, giocotre.length - 5);
		break;

		case "10000":
		diecimila = giocotre.substr(0, giocotre.length - 5);
		break;

		default:
		(await client.users.fetch(koray_id)).send("null_shadows_3");
	}
	//ddebug console.log("3");
	switch(giocoquattro.substr(giocoquattro.length - 5))
	{
		case " 7000":
		settemila = giocoquattro.substr(0, giocoquattro.length - 5);
		break;

		case " 8000":
		ottomila = giocoquattro.substr(0, giocoquattro.length - 5);
		break;

		case " 9000":
		novemila = giocoquattro.substr(0, giocoquattro.length - 5);
		break;

		case "10000":
		diecimila = giocoquattro.substr(0, giocoquattro.length - 5);
		break;

		default:
		(await client.users.fetch(koray_id)).send("null_shadows_4");
	}
	//ddebug console.log("4");
	//
	var a = 0;
	for(let missioni_gioco in ms_obj)
	{
		//ddebug console.log(missioni_gioco);
		for(var i in ms_obj[missioni_gioco])
		{
			var current = ms_obj[missioni_gioco];
			var j = current[i].substr(0, current[i].length - 5);
			if(settemila == j)
			{
				missioneuno = missioni_gioco;
				break;
			}
			else if(ottomila == j)
			{
				missionedue = missioni_gioco;
				break;
			}
			else if(novemila == j)
			{
				missionetre = missioni_gioco;
				break;
			}
			else if(diecimila == j)
			{
				missionequattro = missioni_gioco;
				break;
			}
		}
		a++;
	}
	
	client.channels.cache.get(id_missions_channel).send(
		"@everyone"+
		"\n\n"+
		"-------------**| WEEKLY MISSIONS |**-------------"+
		"\n\n\n"+
		"*-OPEN MISSIONS-*"+
		"\n\n"+
		"**[** @everyone **]** " + settemila + " **[** "+missioneuno+" **]** | **7'000** <:SHADOWSCURRENCY:412717479476068383>\n\n"+
		"**[** @everyone **]** " + ottomila + " **[** "+missionedue+" **]** | **8'000** <:SHADOWSCURRENCY:412717479476068383>\n\n"+
		"**[** @everyone **]** " + novemila + " **[** "+missionetre+" **]** | **9'000** <:SHADOWSCURRENCY:412717479476068383>\n\n"+
		"**[** @everyone **]** " + diecimila + " **[** "+missionequattro+" **]** | **10'000** <:SHADOWSCURRENCY:412717479476068383>"
	);
}*/
