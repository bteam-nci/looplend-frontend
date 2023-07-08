function getCurrentPage(){
		return window.location.pathname;
}
function isLoginPage(){
	return getCurrentPage() === "/login.html" || getCurrentPage() === "/signup.html";
}

export async function protectPage(){
	if (isLoginPage()){
		return;
	}
	const Clerk = window.Clerk;
	if (Clerk.isReady()) {
		const session = await Clerk.session.getToken();
		console.log("Logged in user");
	}
}

export async function isLoggedIn(){
	const session = window.Clerk.session;
	return !!session;
}

export default isLoggedIn;
