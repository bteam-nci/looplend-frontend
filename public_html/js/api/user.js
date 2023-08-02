import api from './base.js';

export async function getUserInfo() {
	const {data} = await api.get(`/me`);
	return data;
}

export async function getUserProducts(params) {
	const {data} = await api.get(`/me/products`, {params});
	return {
		data: data.data.map((product) => ({
			...product,
			price: parseFloat(product.price / 100).toFixed(2)
		}))
	};
}
export async function getUserWishlist(params) {
	const {data} = await api.get(`/me/wishlist`, {params});
	return {
		data: data.data.map((product) => ({
			...product,
			price: parseFloat(product.price / 100).toFixed(2)
		}))
	};
}

export async function getUserRequests(params) {
	const {data} = await api.get(`/me/requests`, {params});
	return {
		data: data.data.map((request) => ({
			...request,
			total: parseFloat(request.total / 100).toFixed(2),
			start: formatDate(new Date(request.start)),
			end: formatDate(new Date(request.end))
		}))
	};
}

function formatDate(date) {
	// DD/MM/YYYY
	return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
