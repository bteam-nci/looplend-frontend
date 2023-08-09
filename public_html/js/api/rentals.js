import api from './base.js';

export async function listRentals(params) {
  const {data} = await api.get('/rentals', {
    params
  });
  return {
    ...data,
    data: data.data.map((rental) => ({
      ...rental,
      total: parseFloat(rental.total / 100).toFixed(2),
      start: formatDate(new Date(rental.start)),
      end: formatDate(new Date(rental.end)),
      createdAt: formatDate(new Date(rental.createdAt))
    }))
  };
}

export async function getRental(rentalId) {
  const {data} = await api.get(`/rentals/${rentalId}`);
  return {
    ...data,
    total: parseFloat(data.total / 100).toFixed(2),
    start: formatDate(new Date(data.start)),
    end: formatDate(new Date(data.end)),
    createdAt: formatDate(new Date(data.createdAt))
  }
}
export async function acceptRequest(rentalId) {
  await api.post(`/rentals/${rentalId}/accept`);
}

export async function denyRequest(rentalId) {
  await api.delete(`/rentals/${rentalId}`);
}

export async function sendFeedbackToOwner(rentalId, feedback) {
  return api.post(`/rentals/${rentalId}/owner/feedbacks`, feedback);
}
export async function sendFeedbackToProduct(rentalId, feedback) {
  return api.post(`/rentals/${rentalId}/product/feedbacks`, feedback);
}

function formatDate(date) {
  // DD/MM/YYYY
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
export async function sendRequest(body) {
  const {data} = await api.post(`/rentals`, body);
  return data;
}
