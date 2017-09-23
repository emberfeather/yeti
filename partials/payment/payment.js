export default class PaymentPartial {
  constructor(config) {
    this.config = config || {}
    this.elContainer = document.querySelector('.payment')
  }
}
