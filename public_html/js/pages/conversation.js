import {isLoggedIn} from "../navigation.js";
import {initClerk} from "../clerk.js";
import {getMessages, sendMessage as sendMessageApi} from "../api/messages.js";
import Loader from "../loader.js";
import {initToaster} from "../toaster.js";
import {getRental} from "../api/rentals.js";

let hasMore = true;
const scrollerLoader = new Loader(document.querySelector("#scrollspy-agent"));
const mainLoader = new Loader(document.querySelector("#messages-list"));
const params = {
	page: 1,
}
let rentalId;
function init(){
	initParams();
	initClerk(initConversation);
	initToaster();
	initComponents();
}

function sendMessage(text) {
	sendMessageApi({
		rentalId,
		text
	}).then((data) => {
		const messageElement = renderMessage(data);
		document.querySelector("#messages-list").prepend(messageElement);
	});
}
function triggerSendMessage(){
	const text = document.getElementById("message-text").value.trim();
	if (text.length > 0){
		document.getElementById("message-text").value = "";
		sendMessage(text);
	}
}
function initComponents(){
	document.getElementById("message-text").addEventListener("keyup", function(event){
		if (event.key === "Enter"){
			triggerSendMessage()
		}
	});
	document.getElementById("send").addEventListener("click", triggerSendMessage);
}
function initParams(){
	const urlParams = new URLSearchParams(window.location.search);
	if (!urlParams.has("id")){
		window.location.href = "/";
	}
	rentalId = urlParams.get("id");
}
document.addEventListener("DOMContentLoaded", init)

function initConversation(){
	if (isLoggedIn()){
		mainLoader.start();
		getRental(rentalId).then((data)=>{
			document.querySelector("#with-name").innerHTML = data.product.name;
			document.querySelector("#with-name").href = `product-detail.html?id=${data.product.id}`;
		});
		getMessages({
			...params,
			rentalId,
		}).then((response) => {
			const {data} = response;
			mainLoader.stop(()=>{
				renderMessages(data);
				initScrollSpy();
			});
		});
	} else {
		window.location.href = "home.html";
	}
}



function initScrollSpy(){
	window.addEventListener("scroll", function() {
		const documentHeight = document.documentElement.scrollHeight;
		const viewportHeight = window.innerHeight;
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const remainingHeight = documentHeight - (viewportHeight + scrollTop);
		const threshold = 200;
		if (remainingHeight <= threshold && hasMore && !scrollerLoader.isLoading) {
			scrollerLoader.start();
			params.page++;
			getMessages({
				...params,
				rentalId,
			}).then((response) => {
				const {data} = response;
				scrollerLoader.stop(()=>{
					renderMessages(data);
				});
			});
		}
	});
}


// should render products as list items
function renderMessages(products){
	const list = document.querySelector("#messages-list");
	products.forEach((message) => {
		list.appendChild(renderMessage(message));
	});
}

function renderMessage(message){
	const item = document.createElement("div");
	const messageElem = document.createElement("div");
	item.classList.add("d-flex");
	item.classList.add("my-2");
	item.classList.add("flex-row");
	if (message.isFromMe){
		messageElem.classList.add("flex-row");
		item.classList.add("justify-content-end");
	}else{
		messageElem.classList.add("flex-row-reverse");
		item.classList.add("justify-content-start");
	}
	messageElem.classList.add("d-flex");
	messageElem.classList.add("align-items-center");

	messageElem.innerHTML = `
	<div class="date m-2">
		${message.createdAt.toLocaleString()}
	</div>
	<div class="${message.isFromMe ? "from-me" : "from-them"} message">
		${message.text}
	</div>
		`;
	item.appendChild(messageElem);
	return item;
}
