import {isLoggedIn} from "./navigation.js";

const publishableKey = "pk_test_bW9yYWwtbGlvbmVzcy01Mi5jbGVyay5hY2NvdW50cy5kZXYk";

const startClerk = async () => {
	const Clerk = window.Clerk;
	try {
		// Load Clerk environment and session if available
		await Clerk.load();
	} catch (err) {
		console.error("Error starting Clerk: ", err);
	}
	initUserFunctions();
	initHeader();
};

function initHeader(){
	if (isLoggedIn()){
		const elementsToAdd = `
				<li class="nav-item">
          <a class="nav-link" href="my-products.html">My products</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Rentals
          </a>
          <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
            <a class="dropdown-item" href="rentals.html">Past rentals</a>
            <a class="dropdown-item" href="my-requests.html">Requests</a>
          </div>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="wishlist.html">Wishlist</a>
        </li>`;
		document.querySelector(".navbar-nav").insertAdjacentHTML("beforeend", elementsToAdd);
	}
}
function hideHeader(){
document.querySelector(".navbar-nav").innerHTML = `
<li class="nav-item active">
	<a class="nav-link" href="products.html">Browse</a>
</li>`;
}

function initUserFunctions(){
	// mount button in dom
	const button = document.getElementById("user-button");
	if (isLoggedIn()){
		document.getElementById("sign-in-link").hidden = true;
		window.Clerk.mountUserButton(button, {
			afterSignOutUrl: "./home.html",
		});
		window.Clerk.addListener((event) => {
			if (event.user === null){
				document.getElementById("sign-in-link").hidden = false;
				hideHeader();
			}
		});
	}
}

export function initClerk(clerkLoadedCallback){
	const script = document.createElement("script");
	script.setAttribute("data-clerk-publishable-key", publishableKey);
	script.async = true;
	script.src = `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`;
	script.crossOrigin = "anonymous";
	script.addEventListener("load", ()=>{
		startClerk().then(() => {
			if(clerkLoadedCallback) clerkLoadedCallback();
		});
	});
	script.addEventListener("error", () => {
		document.getElementById("no-frontend-api-warning").hidden = false;
	});
	document.body.appendChild(script);
}
