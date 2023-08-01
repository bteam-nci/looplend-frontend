const baseURL = 'https://xtsavl1g5j.execute-api.eu-west-1.amazonaws.com/prod';

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


export async function createUploadLink(filename){
	const {data} = await instance.post('/uploads', {
		name: filename
	});

	return data.url;
}

export default instance;
