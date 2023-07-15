export default class Loader {
	isLoading = false;
	constructor(element){
		this.element = element;
	}
	start(){
		this.isLoading = true;
		this.element.innerHTML = `
			<div class="spinner-border" role="status">
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
