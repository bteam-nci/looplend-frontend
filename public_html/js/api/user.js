const baseUrl = 'https://xig8zm7fo3.execute-api.eu-west-1.amazonaws.com/dev';

export async function getUserInfo(userId, token) {
	const response = await fetch(`${baseUrl}/me`, {
		headers: {
			"Authorization": token
		}
	});
	return response.json();
}

export async function getUserRequests(userId, token) {
	const response = await fetch(`${baseUrl}/me/requests`, {
		headers: {
			"Authorization": token
		}
	});
	return response.json();
}
