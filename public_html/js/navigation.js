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
		try {
			const session = await Clerk.session.getToken();
			console.log("Logged in user");
			if (!session) {
				window.location.href = "/login.html";
			}
		} catch (err) {
			console.error("Error getting Clerk session: ", err);
		}
	}
}

export async function isLoggedIn(){
	try{
		const session = await window.Clerk.session.getToken();
		return !!session;
	}catch (e) {
		console.error("Error getting Clerk session: ", e);
		return false;
	}
}

export default protectPage;
