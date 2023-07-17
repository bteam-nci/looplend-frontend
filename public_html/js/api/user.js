import api from './base.js';

export async function getUserInfo() {
	const {data} = await api.get(`/me`);
	return data;
}

export async function getUserProducts(params) {
	console.log(params)
	const {data} = await api.get(`/me/products`, {params});
	return {
		...data,
		data: data.data.map((product) => ({
			...product,
			price: parseFloat(product.price / 100).toFixed(2)
		}))
	};
}

export async function getUserRequests(params) {
	const {data} = await api.get(`/me/requests`, {params});
	return data;
}
