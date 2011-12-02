(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD Registration
		define([ 'jquery' ], factory);
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function($){
	var containers = {};
	var buttons = {};
	var slideDuration = 380;
	
	$(function(){
		containers.loan = $('#loans');
		containers.payment = $('#payment');
		containers.details = $('#details');
		containers.extraDetails = $('#extraDetails');
		
		$('#loanTemplate').template('loan');
		$('#buttonTemplate').template('button');
		
		buttons.addLoan = $.tmpl('button', {
			value: '+ Add'
		});
		
		buttons.addLoan.insertAfter(containers.loan);
		
		$('input', buttons.addLoan).click(function() {
			addLoan();
		});
		
		// Add initial loan
		addLoan(5000, 8.5, 50);
	});
	
	function addLoan(principal, interest, minPayment) {
		var loan = $.tmpl('loan', {
			principal: principal || 0,
			interest: interest || .0,
			minPayment: minPayment || 0
		});
		
		loan.hide().appendTo(containers.loan).slideDown(slideDuration, function() {
			$('input:first', loan).focus();
			$('input.delete', loan).click(function(){
				removeLoan(loan);
			});
		});
	}
	
	function removeLoan(loan) {
		loan.slideUp(slideDuration, function(){
			loan.remove();
			
			if(!$('.loan', containers.loan).length) {
				addLoan();
			}
		});
	}
}));
