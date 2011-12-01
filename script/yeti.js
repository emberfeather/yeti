(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD Registration
		define([ 'jquery' ], factory);
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function($){
	var loanContainer;
	var loans;
	var loanTemplate;
	
	$(function(){
		loanContainer = $('#loans');
		loanTemplate = $('#loanTemplate').template('loan');
		
		// Clear any holder text
		loanContainer.empty();
		
		// Add initial loan
		var loan = $.tmpl('loan', {
			principal: 5000,
			interest: 8.5,
			minPayment: 50
		});
		
		loanContainer.append(loan);
	});
}));
