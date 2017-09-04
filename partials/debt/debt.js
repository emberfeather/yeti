export default class DebtPartial {
  constructor(config) {
    this.config = config || {}
    this.elContainer = document.querySelector('.debt')
    this.elDebtAdd = this.elContainer.querySelector('.debt__add')
    this.elDebtList = this.elContainer.querySelector('.debt__list')
    this.elTemplateDebt = this.elContainer.querySelector('#debt-template')

    this.elDebtAdd.addEventListener('click', this.addDebt.bind(this))

    // Create initial debt information.
    this.addDebt()
  }

  addDebt(e) {
    if (e) {
      e.preventDefault()
    }

    const currentDebt = document.importNode(this.elTemplateDebt.content, true)
    this.elDebtList.appendChild(currentDebt)
  }
}
