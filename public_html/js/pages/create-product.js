import {initClerk} from "../clerk.js";
import {initToaster, pushToast} from "../toaster.js";
import {categories, createProduct, deleteProduct, getProduct} from "../api/products.js";
import {createUploadLink} from "../api/files.js";

let product = {
	category: 7
};

function init() {
	initToaster();
	initClerk(initParams);
	initComponents();
}

document.addEventListener("DOMContentLoaded", init);

// INITS
function initParams() {
	const urlParams = new URLSearchParams(window.location.search);
	let id = urlParams.get("id");
	if (id) {
		// get product
		getProduct(id).then((p) => {
			product = p;
			populateFields(p);
		});
	}
}

function populateFields(p) {

}

function initComponents() {
	document.querySelector("#image-input").addEventListener("change", (ev) => {
		const [file] = ev.target.files
		if (file) {
			document.querySelector("#product img").src = URL.createObjectURL(file);
		}
	});

	document.querySelector("#addAvailabilityButton").addEventListener("click", (ev) => {
		if (!validateDates()) {
			pushToast("Invalid dates", "danger", 2000);
			return;
		}
		const start = formatDate(document.querySelector("#start-date").value);
		const end = formatDate(document.querySelector("#end-date").value);
		if (!product.availabilities) {
			product.availabilities = [];
		}
		product.availabilities.push({
			start,
			end
		});
		document.querySelector("#availabilities-list").appendChild(renderAvailabilityElement(start, end));
	});

	document.querySelector("#start-date").addEventListener("change", function (v) {
		document.querySelector("#end-date").setAttribute("min", v.target.value);
	});

	document.querySelector("#saveButton").addEventListener("click", (ev) => {
		if (!validateProduct()) {
			pushToast("Invalid product", "danger", 2000);
			return;
		}
		const name = document.querySelector("#product-name-input").value;
		const description = document.querySelector("#product-description").value;
		const price = document.querySelector("#product-price-input").value;
		const category = document.querySelector("#category-select").value;
		const productInput = {
			...product,
			name,
			description,
			price,
			category,
		};
		submitProduct(productInput);
	});
	renderCategoryOptions();
}

function submitProduct(product) {
	if (!document.querySelector("#image-input").files[0]) {
		product.image = "https://via.placeholder.com/300";
	}
	createProduct(product).then((p) => {
		product.id = p.id;
		if (!document.querySelector("#image-input").files[0]) {
			return;
		}
		return createUploadLink(p.id, document.querySelector("#image-input").files[0]);
	}).then((link) => {
		if (!link) {
			return;
		}
		return axios.put(link, document.querySelector("#image-input").files[0],
			{
				headers: {
					'Content-Type': 'application/octet-stream'
				}
			});
	}).then(() => {
		pushToast("Product created", "success", 2000);
	}).catch((err) => {
		if (!product.id) {
			const urlParams = new URLSearchParams(window.location.search);
			let id = urlParams.get("id");
			if (!id) {
				deleteProduct(product.id);
			}
		}
		pushToast(`Error creating product: ${err.message}`, "danger", 2000);
	});
}

function validateDates() {
	const start = Date.parse(document.querySelector("#start-date").value);
	const end = Date.parse(document.querySelector("#end-date").value);

	return !(isNaN(start) || isNaN(end) || start > end);
}

function validateProduct() {
	const name = document.querySelector("#product-name-input").value;
	const description = document.querySelector("#product-description").value;
	const price = parseFloat(document.querySelector("#product-price-input").value) * 100;
	const category = document.querySelector("#category-select").value;
	if (isNaN(price) || price <= 0) {
		return false;
	}
	if (name.trim().length === 0 || description.trim().length === 0) {
		return false;
	}
	if (parseInt(category) <= 0) {
		return false;
	}
	return true;
}

// RENDER METHODS
function formatDate(date) {
	date = new Date(date);
	// DD/MM/YYYY
	return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function renderAvailabilityElement(start, end) {
	const availabilityElement = document.createElement("div");
	availabilityElement.dataset.index = document.querySelectorAll(".availability").length;
	availabilityElement.classList.add("d-flex", "align-items-center", "my-2", "flex-row", "availability");
	availabilityElement.innerHTML = `
<div>
	<p class="mb-0"><b>Start:</b> ${start}</p>
</div>
<div class="mx-2">
<p class="mb-0"><b>End:</b> ${end}</p>
</div>
<div>
	<button type="button" class="btn btn-danger btn-sm">Remove</button>
</div>
	`;
	availabilityElement.querySelector("button").addEventListener("click", (ev) => {
		availabilityElement.remove();
		product.availabilities.splice(availabilityElement.dataset.index, 1);
	});
	return availabilityElement;
}

function renderCategoryOptions() {
	const categorySelect = document.querySelector("#category-select");
	categories.forEach((category, index) => {
		const option = document.createElement("option");
		option.value = index + 1;
		option.innerHTML = category.name;
		option.className = `cat-${category.category}`;
		categorySelect.appendChild(option);
	});
}
