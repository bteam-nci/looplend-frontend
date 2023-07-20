import {initClerk} from "../clerk.js";
import {listProduct, addToWishlist, removeFromWishlist, categories} from "../api/products.js";
import Loader from "../loader.js";

let params = {
	page: 1,
	priceEnd: 250 * 100
};

let hasMore = true;
const mainLoader = new Loader(document.querySelector("#products"));
const scrollerLoader = new Loader(document.querySelector("#scrollspy-agent"));
function init(){
	initParams();
	initClerk(initProducts);
	initComponents();
}
document.addEventListener("DOMContentLoaded", init);

const basicParams = ["page", "priceEnd", "category", "start", "end"];
// INITS
function initParams(){
	const urlParams = new URLSearchParams(window.location.search);
	params = Object.keys(Object.fromEntries(urlParams)).filter(k=> basicParams.includes(k)).reduce((acc, k)=>{
		acc[k] = urlParams.get(k);
		return acc;
	}, {});
}

function initComponents(){
	renderCategoryOptions();

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
		params.start = v.target.value;
		triggerSearch();
	});
	document.querySelector("#end-date").addEventListener("change", function(v){
		params.end = v.target.value;
		triggerSearch();
	});
	document.querySelector("#start-date").value = params.start ?? "";
	document.querySelector("#end-date").value = params.end ?? "";

	// PRICE
	document.querySelector("#price-range").value = params.priceEnd ? parseInt(params.priceEnd) : 250 * 100;
	document.querySelector("#price-range").addEventListener("input", function(v){
		document.querySelector("#price-value").innerHTML = `${parseFloat(v.target.value/100).toFixed(0)} &euro;/day`;
		params.priceEnd = v.target.value;
	});
	document.querySelector("#price-range").addEventListener("change", function(){
		triggerSearch();
	})
	// CATEGORY
	document.querySelector("#category-select").addEventListener("change", function(v){
		params.category = parseInt(v.target.value) > 0 ? v.target.value : undefined;
		triggerSearch();
	});
	console.log(params.category)
	document.querySelector("#category-select").value = params.category ?? 0;

	document.querySelector("#reset-search").addEventListener("click", resetSearch);
}

function initProducts(){
	mainLoader.start();
	listProduct(params).then((response) => {
		const {data} = response;
		mainLoader.stop(()=>{
			renderProducts(data);
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
		const threshold = 100;
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

// SEARCH METHODS

function disableInputs(){
	document.querySelector("#start-date").setAttribute("disabled", true);
	document.querySelector("#end-date").setAttribute("disabled", true);
	document.querySelector("#price-range").setAttribute("disabled", true);
	document.querySelector("#category").setAttribute("disabled", true);
}

function enableInputs(){
	document.querySelector("#start-date").removeAttribute("disabled");
	document.querySelector("#end-date").removeAttribute("disabled");
	document.querySelector("#price-range").removeAttribute("disabled");
	document.querySelector("#category").removeAttribute("disabled");
}

function triggerSearch() {
	disableInputs();
	mainLoader.start();
	params.page = 1;
	listProduct(params).then((response) => {
		const {data} = response;
		mainLoader.stop(()=>{
			renderProducts(data);
			initScrollSpy();
			enableInputs();
		});
	});
}

function resetSearch(){
	if (mainLoader.isLoading){
		return;
	}
	document.querySelector("#start-date").value = "";
	document.querySelector("#end-date").value = "";
	document.querySelector("#price-range").value = 250 * 100;
	document.querySelector("#price-value").innerHTML = `250 &euro;/day`;
	document.querySelector("#category-select").value = "0";
	params.start = undefined;
	params.end = undefined;
	params.price = undefined;
	params.category = undefined;
	triggerSearch();
}


export function toggleWishlist(product){
	if (product.isWishlisted) {
		document.querySelector(`.product[data-id="${product.id}"] button`).innerHTML = `<i class="bi bi-heart"></i>`;
		removeFromWishlist(product.id).then(() => {
			product.isWishlisted = false;
		}).catch(() => {
			document.querySelector(`.product[data-id="${product.id}"] button`).innerHTML = `<i class="bi bi-heart-fill"></i>`;
		});
	}else{
		document.querySelector(`.product[data-id="${product.id}"] button`).innerHTML = `<i class="bi bi-heart-fill"></i>`;
		addToWishlist(product.id).then(() => {
			product.isWishlisted = true;
		}).catch(() => {
			document.querySelector(`.product[data-id="${product.id}"] button`).innerHTML = `<i class="bi bi-heart"></i>`;
		});
	}
}



// RENDER METHODS
function renderCategoryOptions(){
	const categorySelect = document.querySelector("#category-select");
	categories.forEach((category, index) => {
		const option = document.createElement("option");
		option.value = index + 1;
		option.innerHTML = category.name;
		option.className = `cat-${category.category}`;
		categorySelect.appendChild(option);
	});
}
function renderProducts(list){
	const products = document.querySelector("#products");
	list.forEach((product) => {
		products.appendChild(renderProductCard(product));
	});
}
function renderProductCard(product){
	const productElement = document.createElement("div");
	productElement.dataset.id = product.id;
	productElement.classList.add("product");
	productElement.innerHTML = `
		<img src="${product.image}" alt="${product.name}">
		<div class="product-info">
			<div class="top-row">
				<div class="price cat-${categories[product.category - 1].category}">${product.price} &euro;/day</div>
				<div class="category cat-${categories[product.category - 1].category}"><i class="${categories[product.category - 1].icon}"></i> </div>
			</div>
			<div class="bottom-row">
				<div class="name cat-${categories[product.category - 1].category}">${product.name}</div>
				<button type="button" class="btn btn-danger m-2"><i class="bi bi-${product.isWishlisted?"heart-fill":"heart"}"></i></button>
			</div>
		</div>
	`;
	productElement.querySelector("button").addEventListener("click", () => toggleWishlist(product));
	return productElement;
}

