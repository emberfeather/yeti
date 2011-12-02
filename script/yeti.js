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
	var allowLocalSave = true;
	
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
		
		containers.loan.on('change', saveData);
		containers.payment.on('change', saveData);
		
		// Check for previously saved loans
		if(localStorage.loans) {
			var loans = JSON.parse(localStorage.loans);
			
			$.each(loans, function(i, value) {
				addLoan(value.principal, value.rate, value.minPayment);
			});
		} else {
			// Add sample loan
			addLoan(5000, 8.5, 50);
		}
		
		$('input[name="payment"]', containers.payment).val(localStorage.payment || 0.00);
	});
	
	function addLoan(principal, rate, minPayment) {
		var loan = $.tmpl('loan', {
			principal: principal || 0,
			rate: rate || 0.0,
			minPayment: minPayment || 0
		});
		
		loan.hide().appendTo(containers.loan).slideDown(slideDuration, function() {
			$('input.delete', loan).click(function(){
				removeLoan(loan);
			});
			
			// Auto focus on the new loan
			$('input[type="number"]:first', loan).focus();
		});
	}
	
	function removeLoan(loan) {
		loan.slideUp(slideDuration, function(){
			loan.remove();
			
			saveData();
			
			if(!$('.loan', containers.loan).length) {
				addLoan();
			}
		});
	}
	
	function saveData() {
		if(!allowLocalSave) {
			return;
		}
		
		// Save the loans
		var loans = [];
		
		$('.loan', containers.loan).each(function(i, element){
			var loan = {};
			
			loan.principal = parseFloat($('input[name="principal"]', element).val()) || 0;
			loan.rate = parseFloat($('input[name="rate"]', element).val()) || 0.0;
			loan.minPayment = parseFloat($('input[name="minPayment"]', element).val()) || 0;
			
			if(loan.principal > 0) {
				loans.push(loan);
			}
		});
		
		localStorage.loans = JSON.stringify(loans);
		
		// Save the payment
		localStorage.payment = parseFloat($('input[name="payment"]', containers.payment).val()) || 0.0;
	}
}));
