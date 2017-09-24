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
    new DebtItem(currentDebt.querySelector('.debt__item'))
    this.elDebtList.appendChild(currentDebt)
  }
}

class DebtItem {
  constructor(el) {
    this.elContainer = el

    this.elRemove = this.elContainer.querySelector('.debt__remove')
    this.elRemove.addEventListener('click', this.removeDebt.bind(this))
  }

  removeDebt() {
    this.elContainer.remove();
  }
}
