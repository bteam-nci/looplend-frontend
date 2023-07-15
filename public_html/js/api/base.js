const baseURL = 'https://xig8zm7fo3.execute-api.eu-west-1.amazonaws.com/dev';

const instance = axios.create({
	baseURL
});

// interceptor to add token from clerk to the request
instance.interceptors.request.use(async (config) => {
	if (!window.Clerk || !window.Clerk.session) return config;

	const token = await window.Clerk.session.getToken();
	config.headers.Authorization = token;

	return config;
});

export default instance;
