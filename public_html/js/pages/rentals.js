import {isLoggedIn} from "../navigation.js";
import {initClerk} from "../clerk.js";
import {listRentals} from "../api/rentals.js";
import Loader from "../loader.js";
import {initToaster} from "../toaster.js";

let hasMore = true;
const mainLoader = new Loader(document.querySelector("#rentals-list"));
const scrollerLoader = new Loader(document.querySelector("#scrollspy-agent"));
const params = {
	page: 1,
}
function init(){
	initToaster();
	initClerk(initRentals);
}
document.addEventListener("DOMContentLoaded", init)

function initRentals(){
	if (isLoggedIn()){
		mainLoader.start();
		listRentals(params).then((response) => {
			const {data} = response;
			mainLoader.stop(()=>{
				renderRentals(data);
				initComponents();
				initScrollSpy();
			});
		});
	} else {
		window.location.href = "home.html";
	}
}

function initComponents(){
	document.querySelector("#status-select").addEventListener("change", function(v){
		params.status = isNaN(parseInt(v.target.value)) ? v.target.value.toUpperCase() : undefined;
		triggerSearch();
	});
}
function triggerSearch(){
	mainLoader.start();
	params.page = 1;
	listRentals(params).then((response) => {
		const {data} = response;
		mainLoader.stop(()=>{
			renderRentals(data);
			initScrollSpy();
		});
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
			listRentals(params).then((response) => {
				const {data} = response;
				if (data.length === 0) {
					hasMore = false;
				}
				scrollerLoader.stop(()=>{
					renderRentals(data);
				});
			});
		}
	});
}

// should render products as list items
function renderRentals(requests){
	const list = document.querySelector("#rentals-list");
	requests.forEach((product) => {
		list.appendChild(renderRentalLine(product));
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

function renderRentalLine(rental){
	const item = document.createElement("div");
	item.classList.add("d-flex");
	item.classList.add("flex-column");
	item.classList.add("flex-lg-row");
	item.classList.add("cursor-pointer");
	item.classList.add("justify-content-between");
	item.classList.add("position-relative");
	item.classList.add("my-2");
	item.classList.add("p-2");
	item.classList.add("border");
	item.setAttribute("data-id", rental.id);
	let backgroundStatus = "primary";
	if(rental.status === "DENIED") backgroundStatus = "danger";
	if(rental.status === "PENDING") backgroundStatus = "warning";
	if(rental.status === "COMPLETED") backgroundStatus = "SUCCESS";

	item.innerHTML = `
<div class="small-product-image">
	<img src="${rental.product.image}" alt="${rental.product.name}" />
</div>
<div class="d-flex flex-column flex-grow-1 mx-2">
	<div class="flex-grow-1">
		<h5>${rental.product.name}</h5> 		
		<div class="text-muted"><span class="badge rounded-pill bg-${backgroundStatus}">${rental.status}</span></div>
		<div class="text-italic">Created at: ${rental.createdAt}</div>
	</div>
	<div class="d-flex flex-column">
		<div class="text-muted">Total: ${rental.total} &euro;</div>
		<div class="text-muted">Dates: ${rental.start} to ${rental.end}</div>
		<div class="text-muted">Owner: ${rental.owner.name}</div>
		<div class="text-muted">Product rating: <span class="rating"></span></div>	
	</div>
</div>
		`;
	item.addEventListener("dblclick", (ev)=>{
		window.location.href = `conversation.html?id=${rental.id}`;
	});
	item.addEventListener("touchend", (ev)=>{
		window.location.href = `conversation.html?id=${rental.id}`;
	});
	renderRating(rental.product.rating).forEach(star=>{
		item.querySelector(".rating").appendChild(star);
	});
	return item;
}
