import {isLoggedIn} from "../navigation.js";
import {initClerk} from "../clerk.js";
import {listProduct, addToWishlist, removeFromWishlist} from "../api/products.js";
import Loader from "../loader.js";

const params = {
	page: 1,
};
let hasMore = true;
const mainLoader = new Loader(document.querySelector("#products"));
const scrollerLoader = new Loader(document.querySelector("#scrollspy-agent"));

(() => {
	initClerk(initProducts);
})();

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
