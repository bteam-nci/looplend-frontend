import {isLoggedIn} from "../navigation.js";
import {initClerk} from "../clerk.js";
import {getUserProducts} from "../api/user.js";
import {deleteProduct, categories} from "../api/products.js";
import Loader from "../loader.js";
import {pushToast, initToaster} from "../toaster.js";

let hasMore = true;
let openedProductModalToDelete = null;
const mainLoader = new Loader(document.querySelector("#products-list"));
const scrollerLoader = new Loader(document.querySelector("#scrollspy-agent"));
const modal = new bootstrap.Modal('#deleteProductModal');
const params = {
	page: 1,
}
function init(){
	initClerk(initMyProducts);
	initComponents();
	initToaster();
}
document.addEventListener("DOMContentLoaded", init)

function initMyProducts(){
	if (isLoggedIn()){
		mainLoader.start();
		getUserProducts(params).then((response) => {
			const {data, total} = response;
			mainLoader.stop(()=>{
				renderProducts(data);
				initScrollSpy();
			});
		});
	} else {
		window.location.href = "home.html";
	}
}

function initComponents(){
	document.querySelector("#confirmDeleteProductButton").addEventListener("click", confirmDeleteProduct);
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
			getUserProducts(params).then((response) => {
				const {data} = response;
				if (data.length === 0) {
					hasMore = false;
				}
				scrollerLoader.stop(()=>{
					renderProducts(data, false);
				});
			});
		}
	});
}


// should render products as list items
function renderProducts(products){
	const list = document.querySelector("#products-list");
	products.forEach((product) => {
		list.appendChild(renderProductLine(product));
	});
}

function renderProductLine(product){
	const item = document.createElement("div");
	item.classList.add("d-flex");
	item.classList.add("flex-lg-row");
	item.classList.add("flex-column");
	item.classList.add("justify-content-between");
	item.classList.add("position-relative");
	item.classList.add("my-2");
	item.classList.add("p-2");
	item.classList.add("border");
	item.setAttribute("data-id", product.id);
	item.innerHTML = `
<div class="small-product-image">
	<img src="${product.image}" alt="${product.name}" />
</div>
<div class="d-flex flex-column flex-grow-1 mx-2">
	<div class="flex-grow-1">
		<h5>${product.name}</h5>
		<p>${product.description}</p>
	</div>
	<div>
		<p class="text-muted">Price: ${product.price} &euro;/day</p>
		<div class="badge rounded-pill cat-${categories[product.category - 1].category}"><i class="${categories[product.category - 1].icon}"></i> ${categories[product.category - 1].name}</div>
	</div>
</div>
<div class="d-flex flex-row align-items-lg-end justify-content-center">
	<a class="btn btn-primary mx-2" href="product-form.html?productId=${product.id}" role="button"><i class="bi bi-pencil-fill"></i> Edit</a>
	<button class="btn btn-danger deleteProductButton" data-bs-toggle="modal" data-bs-target="#deleteProductModal"><i class="bi bi-trash-fill"></i> Delete</button>
</div>
		`;
	item.querySelector(".deleteProductButton").addEventListener("click", (ev)=>{
		openedProductModalToDelete = product;
	});
	return item;
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
function confirmDeleteProduct(){
	// gray out the product div
	const productDiv = document.querySelector(`#products div[data-id="${openedProductModalToDelete.id}"]`);
	showOverlay(productDiv);
	modal.hide();
	// send a request to delete the product
	// if successful, remove the product div
	deleteProduct(openedProductModalToDelete.id).then(()=>{
		productDiv.remove();
	}).catch(err =>{
		pushToast(err.response.data.message, "danger", 2000);
	}).finally(()=>{
		removeOverlay();
	});
}
