import {initToaster} from "../toaster.js";
import {categories} from "../api/products.js";
import {initClerk} from "../clerk.js";
function init(){
	initClerk();
	initToaster();
	initComponents();
}
document.addEventListener("DOMContentLoaded", init)

function initComponents(){


	const categoriesElement = document.querySelector("#categories-list");
	categories.forEach((category,index) => {
		categoriesElement.appendChild(createCategoryElem(category,index));
	});

	const today = new Date();
	today.setDate(today.getDate() + 1);
	const dd = String(today.getDate()).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
	const yyyy = today.getFullYear();
	today.setDate(today.getDate() + 1);
	const dd2 = String(today.getDate()).padStart(2, "0");
	const mm2 = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
	const yyyy2 = today.getFullYear();

	document.querySelector("#start-date").addEventListener("change", function(v){
		document.querySelector("#end-date").setAttribute("min", v.target.value);
	});
	document.querySelector("#end-date").addEventListener("change", function(v){
		document.querySelector("#start-date").setAttribute("max", v.target.value);
	});

	document.querySelector("#start-date").setAttribute("min", `${yyyy}-${mm}-${dd}`);
	document.querySelector("#end-date").setAttribute("min", `${yyyy2}-${mm2}-${dd2}`);
	document.querySelector("#start-date").setAttribute("max", `${yyyy2}-${mm2}-${dd2}`);
	document.querySelector("#start-date").setAttribute("value", `${yyyy}-${mm}-${dd}`);
	document.querySelector("#end-date").setAttribute("value", `${yyyy2}-${mm2}-${dd2}`);

	document.querySelector("#search").addEventListener("click", () => {
		const start = document.querySelector("#start-date").value;
		const end = document.querySelector("#end-date").value;

		window.location.href = `products.html?start=${start}&end=${end}`;
	});
}

function createCategoryElem(cat, index){
	const catElement = document.createElement("div");
	catElement.classList.add("category");
	catElement.classList.add(`cat-${cat.category}`);
	catElement.innerHTML = `
		<i class="${cat.icon}"></i>
		<div class="cat-info">
			<h3>${cat.name}</h3>
		</div>
	`;
	// catElement.querySelector("button").addEventListener("click", () => {});
	catElement.addEventListener("click", () => {
		if (isScrolling) return;
		window.location.href = `products.html?category=${index+1}`;
	});
	return catElement;
}
