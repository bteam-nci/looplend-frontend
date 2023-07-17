function generateToast(message, type , duration){
	const toast = document.createElement('div');
	toast.classList.add('toast');
	toast.classList.add('align-items-center');
	toast.classList.add('text-bg-'+type);
	toast.classList.add('border-0');
	toast.setAttribute('role', 'alert');
	toast.setAttribute('aria-live', 'assertive');
	toast.setAttribute('aria-atomic', 'true');
	toast.setAttribute('data-bs-autohide', 'true');
	toast.setAttribute('data-bs-delay', duration);
	toast.innerHTML = `
		<div class="d-flex">
			<div class="toast-body">
				${message}
			</div>
			<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
		</div>
	`;
	return toast;
}
export function pushToast(message, type = "primary", duration = 3000){
	const toastContainer = document.querySelector('.toast-container');
	const toast = generateToast(message, type, duration);
	toastContainer.appendChild(toast);
	const bsToast = new bootstrap.Toast(toast);
	bsToast.show();
	toast.addEventListener('hidden.bs.toast', ()=>{
		toast.remove();
	});
}

export function initToaster(){
	const toastContainer = document.createElement('div');
	toastContainer.classList.add('toast-container');
	toastContainer.classList.add('position-fixed');
	toastContainer.classList.add('bottom-0');
	toastContainer.classList.add('end-0');
	toastContainer.classList.add('p-3');
	document.querySelector("body").appendChild(toastContainer);
}

