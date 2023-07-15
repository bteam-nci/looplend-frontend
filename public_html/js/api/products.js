import api from './base.js';

export async function listProduct(params) {
	const {data} = await api.get('/products', {
		params
	});
	return {
		...data,
		data: data.data.map((product) => ({
			...product,
			price: parseFloat(product.price / 100).toFixed(2)
		}))
	};
}
export async function addToWishlist(productId) {
	const {data} = await api.post(`/products/${productId}/wishlist`);
	return data;
}
export async function removeFromWishlist(productId) {
	const {data} = await api.delete(`/products/${productId}/wishlist`);
	return data;
}
export async function getMeProducts() {
	const {data} = await api.get('/me');
	return data.products;
}
