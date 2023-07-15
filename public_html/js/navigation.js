function getCurrentPage(){
		return window.location.pathname;
}
function isLoginPage() {
	return getCurrentPage() === "/login.html" || getCurrentPage() === "/signup.html";
}

export function isLoggedIn(){
	if (!window.Clerk) return false;
	const session = window.Clerk.session;
	return !!session;
}

export default isLoggedIn;
