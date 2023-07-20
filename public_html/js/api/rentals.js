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
export async function acceptRequest(rentalId) {
  console.log(rentalId);
  await api.post(`/rentals/${rentalId}/accept`);
}

export async function denyRequest(rentalId) {
  await api.delete(`/rentals/${rentalId}`);
}

function formatDate(date) {
  // DD/MM/YYYY
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
