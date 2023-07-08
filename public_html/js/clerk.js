import {isLoggedIn, protectPage} from "./navigation.js";

const publishableKey = "pk_test_bW9yYWwtbGlvbmVzcy01Mi5jbGVyay5hY2NvdW50cy5kZXYk";

const startClerk = async () => {
	const Clerk = window.Clerk;
	try {
		// Load Clerk environment and session if available
		await Clerk.load();
	} catch (err) {
		console.error("Error starting Clerk: ", err);
	}
	await initUserFunctions();
};

async function initUserFunctions(){
	// mount button in dom
	const button = document.getElementById("user-button");
	window.Clerk.mountUserButton(button);
}

(() => {
	const script = document.createElement("script");
	script.setAttribute("data-clerk-publishable-key", publishableKey);
	script.async = true;
	script.src = `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`;
	script.crossOrigin = "anonymous";
	script.addEventListener("load", startClerk);
	script.addEventListener("error", () => {
		document.getElementById("no-frontend-api-warning").hidden = false;
	});
	document.body.appendChild(script);
})();
