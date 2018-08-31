let subject = 'Crack en inferiores: :playerName';
const urls = [
	'https://drive.google.com/open?id=1K6zS2XX1adT0wgBDF-7K4DB79Uyo7RdUqJP_6RYzK44', // normal
	'https://drive.google.com/open?id=157ugVo13Bp7ibZ-knSui1Y3_gakC3ee-gj45cuTuggY', // best no friendly
	'https://drive.google.com/open?id=1NKpYDpocY2zp8EBLIZF_OjzpB-rXMeWLTfQ2CuKmtVM', // best no league
	'https://drive.google.com/open?id=16d9QdobMJXkV_50qjcGQc_FDSWp4MQPhC04HULZKBeI'  // best normal
];
const bodies = ['', '', '', ''];
const msgs = [
	chrome.i18n.getMessage('normal'), 
	chrome.i18n.getMessage('bestNoFriendly'), 
	chrome.i18n.getMessage('bestNoLeague'),
	chrome.i18n.getMessage('bestNormal')
];
let buttons;
let thread;

let player;
const mailBody = document.getElementById('ctl00_ctl00_CPContent_CPMain_ucEditorMain_txtBody');
const mailSubject = document.getElementById('ctl00_ctl00_CPContent_CPMain_tbSubject');
const table = document.getElementsByClassName('form thin')[0] ;
const container = document.createElement('DIV');
const threadSpan = document.createElement('SPAN');

const run = function() {
	if(!player) {
		return;
	}
	mailSubject.value = subject.replace(':playerName', player.name);
	container.className = 'pasteMailContainer';
	hide(container);
	createThreadSpan();
    buttons = msgs.map((message, index) => createButton(message, index));

	let sendMailButton = document.getElementById('ctl00_ctl00_CPContent_CPMain_btnSendNew');
	sendMailButton.addEventListener('click', () => clearPlayer());
};

const createThreadSpan = function() {
	threadSpan.innerHTML = '&nbsp;';
	let row = document.createElement('TR');
	row.appendChild(document.createElement('TD'));
	let td = document.createElement('TD');
	row.appendChild(td);
	td.appendChild(threadSpan);
	table.appendChild(row);
}

const hide = function(elm) {
	elm.style.visibility = 'hidden';
}

const show = function(elm) {
	elm.style.visibility = 'visible';
}

const sendMailAction = function(index) {
	if(!thread || !bodies[index]) {
		return;
	}
	mailBody.value = bodies[index].normalize().replace('{0}', player.name).replace('{1}', '[youthplayerid=' + player.id + ']').replace('{4}', thread);
};

const createButton = function(message, index) {
	let button = document.createElement('A');
	hide(button);
	button.attributes.role = 'button';
	button.title = message;
	button.className = 'pasteMailButton';
	button.id = 'template' + (index + 1);
	button.innerHTML = '<img alt="' + message + '" src="/Img/Icons/transparent.gif">';
	container.appendChild(button);
	mailBody.parentNode.insertBefore(container, mailBody);
	button.addEventListener('click', () => sendMailAction(index));
    return button;
};

const clearPlayer = function() {
	chrome.storage.local.set({"player": null}, ()  => {});
};

chrome.storage.local.get(['player'], result => {
	player = result.player;
	run();
});

bodies.map((body, index) => {
	fetch(urls[index])
		.then(response => response.text())
		.then(text => {
			let txt = text.substring(text.indexOf('"s":"') + 5).split('"', 2);
			show(container);
			show(buttons[index]);
			let result = txt[0].replace(/\\n/g, '\n').replace(/\\u003d/, '=');
			bodies[index] = result;
			return result;
		})
		.catch(err => console.log(err));
});

chrome.storage.local.get(['thread'], result => {
	thread = result.thread;
	let splitted = thread.split('.');
	fetch('/Forum/Read.aspx?t=' + splitted[0] + '&n=' + splitted[1] + '&v4')
		.then(response => response.text())
		.then(text => {
			let parser = new DOMParser();
		    let htmlDocument = parser.parseFromString(text, "text/html");
			let result = htmlDocument.querySelectorAll('div.mainConf > div.boxHead > h2 > span.float_left > a[href*="/Forum/Read.aspx"]');
			threadSpan.id = thread;
			
			for(title of result) {
				if(title.innerText.indexOf('Sub17') !== -1) {
					threadSpan.innerText = title.innerText;
					break;
				}
			}
			if(threadSpan.innerHTML === '&nbsp;') {
				threadSpan.innerText = chrome.i18n.getMessage('threadNotFound');
			}
		})
		.catch(err => console.log(err));
});