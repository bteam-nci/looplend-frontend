import {initClerk} from "../clerk.js";
import {getProduct, categories, removeFromWishlist, addToWishlist} from "../api/products.js";
import {sendRequest} from "../api/rentals.js";
import {initToaster, pushToast} from "../toaster.js";
import isLoggedIn from "../navigation.js";

const modal = new bootstrap.Modal('#createRequestModal');
let productId;
let productPrice;
function init(){
	initParams();
	initToaster();
	initClerk(initProduct);
	initComponents();
}
document.addEventListener("DOMContentLoaded", init);

const basicParams = ["page", "priceEnd", "category", "start", "end"];
// INITS
function initParams(){
	const urlParams = new URLSearchParams(window.location.search);
	if (!urlParams.has("id")){
		window.location.href = "/";
	}
	productId = urlParams.get("id");
}

function initComponents(){
	// DATES
	// set min date to today
	const today = new Date();
	today.setDate(today.getDate() + 1);
	const dd = String(today.getDate()).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
	const yyyy = today.getFullYear();
	today.setDate(today.getDate() + 1);
	const dd2 = String(today.getDate()).padStart(2, "0");
	const mm2 = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
	const yyyy2 = today.getFullYear();

	document.querySelector("#start-date-request").addEventListener("change", function(v){
		document.querySelector("#end-date-request").setAttribute("min", v.target.value);
		changeTotalDays();
	});
	document.querySelector("#end-date-request").addEventListener("change", function(v){
		document.querySelector("#start-date-request").setAttribute("max", v.target.value);
		changeTotalDays();
	});

	document.querySelector("#confirmRequestButton").addEventListener("click", function(){
		createRequest(document.querySelector("#start-date-request").value, document.querySelector("#end-date-request").value, productId);
	});

	document.querySelector("#start-date-request").setAttribute("min", `${yyyy}-${mm}-${dd}`);
	document.querySelector("#end-date-request").setAttribute("min", `${yyyy2}-${mm2}-${dd2}`);
	document.querySelector("#start-date-request").setAttribute("max", `${yyyy2}-${mm2}-${dd2}`);
	document.querySelector("#start-date-request").setAttribute("value", `${yyyy}-${mm}-${dd}`);
	document.querySelector("#end-date-request").setAttribute("value", `${yyyy2}-${mm2}-${dd2}`);

}

function initProduct(){
	getProduct(productId).then((response) => {
		productPrice = response.price;
		renderProduct(response);
	});
}

function changeTotalDays(){
	const startDate = new Date(document.querySelector("#start-date-request").value);
	const endDate = new Date(document.querySelector("#end-date-request").value);
	const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
	document.querySelector("#total-days").innerHTML = days;
	document.querySelector("#total-price").innerHTML = `${days * productPrice} &euro;`;
}
export function toggleWishlist(product){
	if(isLoggedIn()){
		if (product.isWishlisted) {
			document.querySelector(`#wishlist`).innerHTML = `<i class="bi bi-heart"></i> Add to Wishlist`;
			removeFromWishlist(product.id).then(() => {
				product.isWishlisted = false;
			}).catch(() => {
				document.querySelector(`#wishlist`).innerHTML = `<i class="bi bi-heart-fill"></i> Wishlisted`;
			});
		}else{
			document.querySelector(`#wishlist`).innerHTML = `<i class="bi bi-heart-fill"></i> Wishlisted`;
			addToWishlist(product.id).then(() => {
				product.isWishlisted = true;
			}).catch(() => {
				document.querySelector(`#wishlist`).innerHTML = `<i class="bi bi-heart"></i> Add to Wishlist`;
			});
		}
	}else{
		pushToast("You must be logged in to add products to your wishlist", "danger", 2000);
	}
}


// REQUEST METHODS
function createRequest(start, end, productId){
	if (!isLoggedIn()){
		pushToast( "You must be logged in to create a rental request", "danger", 2000);
		return;
	}

	sendRequest({start, end, productId}).then(() => {
		modal.hide();
		pushToast("Rental request created", "success", 2000);
	}).catch(err =>{
		console.log(err);
		pushToast(err.response.data.message, "danger", 2000);
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


// RENDER METHODS
function renderProduct(product){
	const productElement = document.querySelector("#product");
	productElement.querySelector("h2").innerHTML = product.name;
	productElement.querySelector("img").setAttribute("src", product.image);
	productElement.querySelector("#product-description").innerHTML = product.description;
	productElement.querySelector(".price").innerHTML = `${product.price} &euro;/day`;
	productElement.querySelector(".category").innerHTML = `<i class="${categories[product.category].icon}"></i> ${categories[product.category].name}`;
	productElement.querySelector(".category").classList.add(`cat-${product.category}`);

	if (product.feedbacks){
		product.feedbacks.forEach((feedback) => {
			productElement.querySelector("#product-feedback").appendChild(renderFeedback(feedback));
		});
	}
	if (product.owner.feedbacks){
		product.owner.feedbacks.forEach((feedback) => {
			productElement.querySelector("#owner-feedback").appendChild(renderFeedback(feedback));
		});
	}
	productElement.querySelector("#request").addEventListener("click",() => {
		changeTotalDays();
		modal.show();
	})
	productElement.querySelector("#wishlist").addEventListener("click", () => toggleWishlist(product));
	productElement.querySelector("#wishlist").innerHTML = `<i class="bi bi-${product.isWishlisted?"heart-fill":"heart"}"></i> ${product.isWishlisted?"Wishlisted":"Add to wishlist"}`;
	productElement.querySelector("#request").innerHTML = `Create request`;

	return productElement;
}
function formatDate(date) {
	date = new Date(date);
	// DD/MM/YYYY
	return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
}
function renderFeedback(feedback){
	const feedbackElement = document.createElement("div");
	feedbackElement.classList.add("feedback");
	feedbackElement.innerHTML = `
		<div class="feedback-header">
			<span class="feedback-name">${feedback.fullName}</span>
			<span class="feedback-rating">
				${renderRating(feedback.rating).map((star) => star.outerHTML).join("")}
			</span>
			</div>
		<div class="feedback-body">
			<span class="feedback-date">${formatDate(feedback.createdAt)}</span>
			<div class="feedback-comment">
				${feedback.text}
			</div>
		</div>
	`;

	return feedbackElement;
}
