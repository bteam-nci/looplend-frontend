export default class Loader {
	isLoading = false;
	constructor(element){
		this.element = element;
	}
	start(){
		this.isLoading = true;
		this.element.innerHTML = `
			<div class="d-flex flex-row justify-content-center align-items-center">
					<div class="spinner-border" role="status">
					</div>
			</div>
		`;
	}
	stop(callback){
		this.element.innerHTML = "";
		if (callback) {
			callback();
		}
		this.isLoading = false;
	}
}
