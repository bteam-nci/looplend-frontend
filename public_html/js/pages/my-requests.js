import {isLoggedIn} from "../navigation.js";
import {initClerk} from "../clerk.js";
import {getUserRequests} from "../api/user.js";
import {acceptRequest, denyRequest} from "../api/rentals.js";
import Loader from "../loader.js";
import {pushToast, initToaster} from "../toaster.js";

let hasMore = true;
let openedRequestActionModal = null;
const mainLoader = new Loader(document.querySelector("#requests-list"));
const scrollerLoader = new Loader(document.querySelector("#scrollspy-agent"));
const modal = new bootstrap.Modal('#confirmActionModal');
const params = {
	page: 1,
}
function init(){
	initComponents();
	initToaster();
	initClerk(initMyRequests);
}

document.addEventListener("DOMContentLoaded", init)

function initMyRequests(){
	if (isLoggedIn()){
		mainLoader.start();
		getUserRequests(params).then((response) => {
			const {data} = response;
			mainLoader.stop(()=>{
				renderRequests(data);
				initScrollSpy();
			});
		});
	} else {
		window.location.href = "home.html";
	}
}

function initComponents(){
	document.querySelector("#confirmActionButton").addEventListener("click", (ev)=>{
		confirmAction(ev.target.getAttribute("data-action"));
	});
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
			getUserRequests(params).then((response) => {
				const {data} = response;
				if (data.length === 0) {
					hasMore = false;
				}
				scrollerLoader.stop(()=>{
					renderRequests(data, false);
				});
			});
		}
	});
}

// should render products as list items
function renderRequests(requests){
	const list = document.querySelector("#requests-list");
	requests.forEach((product) => {
		list.appendChild(renderRequestLine(product));
	});
}

function renderRating(number){
	const stars = [];
	let added = 0;
	// filled
	for(let i = 0; i < parseInt(number); i++){
		const star = document.createElement('i');
		star.classList.add("bi");
		star.classList.add("bi-star-fill");
		stars.push(star);
	}
	added = parseInt(number);
	if(number > parseInt(number)){
		const star = document.createElement('i');
		star.classList.add("bi");
		star.classList.add("bi-star-half");
		stars.push(star);
		added++;
	}

	for(let i = 0; i < 5 - added; i++){
		const star = document.createElement('i');
		star.classList.add("bi");
		star.classList.add("bi-star");
		stars.push(star);
	}
	return stars;
}

function renderRequestLine(request){
	const item = document.createElement("div");
	item.classList.add("d-flex");
	item.classList.add("flex-lg-row");
	item.classList.add("flex-column");
	item.classList.add("justify-content-between");
	item.classList.add("cursor-pointer");
	item.classList.add("position-relative");
	item.classList.add("my-2");
	item.classList.add("p-2");
	item.classList.add("border");
	item.setAttribute("data-id", request.id);
	item.innerHTML = `
<div class="small-product-image">
	<img src="${request.product.image}" alt="${request.product.name}" />
</div>
<div class="d-flex flex-column flex-grow-1 mx-2">
	<div class="flex-grow-1">
		<h5>${request.product.name}</h5>
	</div>
	<div class="d-flex flex-column">
		<div class="text-muted">Total: ${request.total} &euro;</div>
		<div class="text-muted">Dates: ${request.start} to ${request.end}</div>
		<div class="text-muted">Borrower: ${request.borrower.name} <span class="rating"></span></div>
	</div>
</div>
<div class="d-flex flex-row align-items-lg-end justify-content-center requestActions">
	${
		request.status === "PENDING"? `<button class="btn btn-success confirmActionRequestButton mx-2" data-action="accept"> Accept</button>
	<button class="btn btn-danger confirmActionRequestButton" data-action="deny"> Deny</button>`:`<div class="text-muted">${request.status}</div>`
	}
</div>
		`;
	item.addEventListener("dblclick", (ev)=>{
		window.location.href = `conversation.html?id=${request.id}`;
	});
	item.querySelectorAll(".confirmActionRequestButton").forEach((button)=>{
		button.addEventListener("click", (ev)=>{
			const action = ev.target.getAttribute("data-action");
			renderModal(action);
			openedRequestActionModal = request;
			modal.show();
		});
	});
	renderRating(request.borrower.rating).forEach(star=>{
		item.querySelector(".rating").appendChild(star);
	});
	return item;
}

function renderModal(action){
	const modal = document.querySelector("#confirmActionModal");
	modal.querySelector(".modal-title").innerText = `Are you sure you want to ${action} this request?`;
	modal.querySelector("#confirmActionButton").innerText = action.charAt(0).toUpperCase() + action.slice(1);
	modal.querySelector("#confirmActionButton").setAttribute("data-action", action);
	if (action === "accept"){
		modal.querySelector("#confirmActionButton").classList.remove("btn-danger");
		modal.querySelector("#confirmActionButton").classList.add("btn-success");
	}else{
		modal.querySelector("#confirmActionButton").classList.remove("btn-success");
		modal.querySelector("#confirmActionButton").classList.add("btn-danger");
	}
}
function showOverlay(element){
	element.classList.add("position-relative");
	const overlay = createOverlayElement();
	element.prepend(overlay);
}
function removeOverlay(){
	document.querySelector("#overlay").remove();
}
function createOverlayElement(){
	const overlay = document.createElement("div");
	overlay.classList.add("position-absolute");
	overlay.classList.add("bg-light");
	overlay.classList.add("rounded-sm");
	overlay.classList.add("overlay-load");
	overlay.classList.add("d-flex");
	overlay.classList.add("justify-content-center");
	overlay.classList.add("align-items-center");
	overlay.style.inset = "0px";
	overlay.style.opacity = "0.85";
	overlay.style.backdropFilter = "blur(2px)";
	overlay.id = "overlay";

	overlay.innerHTML = `
		<div class="spinner-border text-primary" role="status">
			<span class="visually-hidden">Loading...</span>
		</div>
	`;

	return overlay;
}
function confirmAction(action){
	// gray out the product div
	const productDiv = document.querySelector(`#requests div[data-id="${openedRequestActionModal.id}"]`);
	showOverlay(productDiv);
	modal.hide();
	let functionToTake = acceptRequest;
	if (action === "deny"){
		functionToTake = denyRequest;
	}
	functionToTake(openedRequestActionModal.id).then(()=>{
		productDiv.remove();
		pushToast(`Request ${action === "deny"?"denied":"accepted"}`, "success", 2000);
	}).catch(err =>{
		console.log(err)
		pushToast(err.response.data.message, "danger", 2000);
	}).finally(()=>{
		removeOverlay();
	});
}
