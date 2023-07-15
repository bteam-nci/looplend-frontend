import {isLoggedIn} from "../navigation.js";
import {initClerk} from "../clerk.js";
import {listProduct, addToWishlist, removeFromWishlist} from "../api/products.js";
import Loader from "../loader.js";

const tmpParams = {
	page: 1,
}
const params = {
	page: 1,
};

let hasMore = true;
const mainLoader = new Loader(document.querySelector("#products"));
const scrollerLoader = new Loader(document.querySelector("#scrollspy-agent"));

(() => {
	initClerk(initProducts);
	initComponents();
})();


function initComponents(){
	// DATES
	// set min date to today
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
	const yyyy = today.getFullYear();

	document.querySelector("#start-date").setAttribute("min", `${yyyy}-${mm}-${dd}`);
	// end date min date is start date
	document.querySelector("#start-date").addEventListener("change", function(v){
		document.querySelector("#end-date").setAttribute("min", v.target.value);
		tmpParams.start = v.target.value;
	});
	document.querySelector("#end-date").addEventListener("change", function(v){
		tmpParams.end = v.target.value;
	});

	// PRICE
	document.querySelector("#price-range").addEventListener("input", function(v){
		document.querySelector("#price-value").innerHTML = `${parseFloat(v.target.value/100).toFixed(0)} &euro;/day`;
		tmpParams.price = v.target.value;
	});

	// CATEGORY
	document.querySelector("#category").addEventListener("change", function(v){
		tmpParams.category = parseInt( v.target.value);
	});
}
function initProducts(){
	if (isLoggedIn()){
		mainLoader.start();
		listProduct(params).then((response) => {
			const {data, total} = response;
			mainLoader.stop(()=>{
				renderProducts(data);
				initScrollSpy();
			});
		});
	}
}
function initScrollSpy(){
	window.addEventListener("scroll", function() {
		const documentHeight = document.documentElement.scrollHeight;
		const viewportHeight = window.innerHeight;
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const remainingHeight = documentHeight - (viewportHeight + scrollTop);
		const threshold = 50;
		if (remainingHeight <= threshold && hasMore && !scrollerLoader.isLoading) {
			scrollerLoader.start();
			params.page++;
			listProduct(params).then((response) => {
				const {data} = response;
				if (data.length === 0) {
					hasMore = false;
				}
				scrollerLoader.stop(()=>{
					renderProducts(data);
				});
			});
		}
	});
}
function renderProducts(list){
	const products = document.querySelector("#products");
	list.forEach((product) => {
		products.appendChild(renderProductCard(product));
	});
}

export function toggleWishlist(product){
	if (product.isWishlisted) {
		document.querySelector(`.product[data-id="${product.id}"] button`).innerHTML = `<i class="bi bi-heart"></i>`;
		removeFromWishlist(product.id).then((response) => {
			product.isWishlisted = false;
		}).catch((error) => {
			document.querySelector(`.product[data-id="${product.id}"] button`).innerHTML = `<i class="bi bi-heart-fill"></i>`;
		});
	}else{
		document.querySelector(`.product[data-id="${product.id}"] button`).innerHTML = `<i class="bi bi-heart-fill"></i>`;
		addToWishlist(product.id).then((response) => {
			product.isWishlisted = true;
		}).catch((error) => {
			document.querySelector(`.product[data-id="${product.id}"] button`).innerHTML = `<i class="bi bi-heart"></i>`;
		});
	}
}

// render the product in a card
function renderProductCard(product){
	const productElement = document.createElement("div");
	productElement.dataset.id = product.id;
	productElement.classList.add("product");
	productElement.innerHTML = `
		<img src="${product.image}" alt="${product.name}">
		<div class="product-info">
			<div class="top-row">
				<div class="price">${product.price} &euro;/day</div>
			</div>
			<div class="bottom-row">
				<div class="name">${product.name}</div>
				<button type="button" class="btn btn-danger m-2"><i class="bi bi-${product.isWishlisted?"heart-fill":"heart"}"></i></button>
			</div>
		</div>
	`;
	productElement.querySelector("button").addEventListener("click", () => toggleWishlist(product));
	return productElement;
}
