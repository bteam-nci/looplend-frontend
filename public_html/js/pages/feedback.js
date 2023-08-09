import {initClerk} from "../clerk.js";
import {initToaster, pushToast} from "../toaster.js";
import {getRental, sendFeedbackToOwner, sendFeedbackToProduct} from "../api/rentals.js";

let rentalId;

function initFeedback() {
	getRental(rentalId).then(rental => {
		document.querySelector("#product-name").innerHTML = rental.product.name;
		document.querySelector("#owner-name").innerHTML = rental.owner.fullName;
	}).catch(err => {
		pushToast("Something went wrong", "success", 2000);
	})
}

function init(){
	initParams();
	initClerk(initFeedback);
	initToaster();
	initComponents();
}

function sendFeedback(ownerFeedback, productFeedback){
	showOverlay(document.querySelector("#feedback"));
	sendFeedbackToOwner(rentalId, ownerFeedback).then(() => {
		return sendFeedbackToProduct(rentalId, productFeedback)
	}).then(() => {
		pushToast("Feedback sent", "success", 2000);
	}).catch(err => {
		pushToast(err.response.data.message, "danger", 2000);
	}).finally(removeOverlay);
}

function initComponents(){
	document.querySelector("#saveButton").addEventListener("click", ()=>{
		const ownerFeedback = {
			text: document.querySelector("#text-feedback-owner").value.trim(),
			rating: parseInt(document.querySelector("#rating-feedback-owner").value)
		};
		const productFeedback = {
			text: document.querySelector("#text-feedback-product").value.trim(),
			rating: parseInt(document.querySelector("#rating-feedback-product").value)
		}
		if (ownerFeedback.rating === 0 || productFeedback.rating === 0){
			pushToast("Please select a rating", "danger", 2000);
			return;
		}
		if (ownerFeedback.text === "" || productFeedback.text === ""){
			pushToast("Please write a comment", "danger", 2000);
			return;
		}
		sendFeedback(ownerFeedback, productFeedback);
	});
}
function initParams(){
	const urlParams = new URLSearchParams(window.location.search);
	if (!urlParams.has("id")){
		window.location.href = "/";
	}
	rentalId = urlParams.get("id");
}
document.addEventListener("DOMContentLoaded", init)

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
