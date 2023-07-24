function generateToast(message, type , duration){
	const toast = document.createElement('div');
	toast.classList.add('toast');
	toast.classList.add('align-items-center');
	toast.classList.add('text-bg-'+type);
	toast.classList.add('border-0');
	toast.classList.add('my-2');
	toast.setAttribute('role', 'alert');
	toast.setAttribute('aria-live', 'assertive');
	toast.setAttribute('aria-atomic', 'true');
	toast.setAttribute('data-bs-autohide', 'true');
	toast.setAttribute('data-bs-delay', duration);
	toast.innerHTML = `
		<div class="d-flex">
			<div class="toast-body fw-bold fs-6">
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
	// position at center top
	toastContainer.classList.add('toast-container');
	toastContainer.classList.add('position-fixed');
	toastContainer.classList.add('d-flex');
	toastContainer.classList.add('top-0');
	toastContainer.classList.add('start-50');
	toastContainer.classList.add('translate-middle-x');
	toastContainer.classList.add('flex-column-reverse');
	toastContainer.classList.add('p-3');
	document.querySelector("body").appendChild(toastContainer);
}

