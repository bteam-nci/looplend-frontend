import api from './base.js';
export const categories = [
	{
		"category": "sports",
		"name": "Sports",
		"icon": "bi bi-trophy-fill"
	},
	{
		"category": "tech",
		"name": "Tech",
		"icon": "bi bi-laptop"
	},
	{
		"category": "crafts-and-arts",
		"name": "Crafts and arts",
		"icon": "bi bi-palette-fill"
	},
	{
		"category": "toys",
		"name": "Toys",
		"icon": "bi bi-joystick"
	},
	{
		"category": "books-and-movies",
		"name": "Books and movies",
		"icon": "bi bi-book"
	},
	{
		"category": "homeware",
		"name": "Homeware",
		"icon": "bi bi-house-door"
	},
	{
		"category": "other",
		"name": "Other",
		"icon": "bi bi-collection"
	}
];

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
export async function getProduct(productId) {
	const {data} = await api.get(`/products/${productId}`,{
		params: {
			extendedEntity: true
		}
	});
	return {
		...data,
		price: parseFloat(data.price / 100).toFixed(2)
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
export async function deleteProduct(productId) {
	const {data} = await api.delete(`/products/${productId}`);
	return data.products;
}

export async function createProduct(product) {
	product.price = parseInt(parseFloat(product.price) * 100);
	product.category = parseInt(product.category);
	const {data} = await api.post('/products', product);
	return data;
}
export async function editProduct(product) {
	if (product.price) {
		product.price = parseInt(parseFloat(product.price) * 100);
	}
	if (product.category) {
		product.category = parseInt(product.category);
	}
	const {data} = await api.put(`/products/${product.id}`, product);
	return data;
}
