import api from "./base.js";
import {getUser} from "../clerk.js";

export async function getMessages(params) {
	const userId = getUser().id;
	const {data} = await api.get(`/conversations/${params.rentalId}/messages`, {
		page: params.page,
	});
	return {
		...data,
		data: data.data.map((message) => ({
			...message,
			createdAt: new Date(message.createdAt),
			isFromMe: message.senderId === userId
		}))
	};
}

export async function sendMessage(params) {
	const {data} = await api.post(`/conversations/${params.rentalId}/messages`, {
		text: params.text,
	});
	return {
		...data,
		createdAt: new Date(data.createdAt),
		isFromMe: true
	};
}
