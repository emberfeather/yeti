import { h, Component } from 'preact'
import YetiDebt from '../yeti/debt'
import Debts from './debts'
import Payment from './payment'
import PlanAccelerate from './plan_accelerate'
import PlanDetail from './plan_detail'
import PlanInterestChart from './plan_interest_chart'
import PlanPayoffTimeline from './plan_payoff_timeline'
import PlanPicker from './plan_picker'
import PlanSuggested from './plan_suggested'
import Save from './save'

import { findParentByClassname } from '../utility/dom'


export interface AppProps {
}


export interface AppState {
  debts: YetiDebt[]
  doLocalSave: boolean
  locale: string
  payment: number
}


export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    const doLocalSave = localStorage.getItem('yeti.save') == 'true'

    let debts: YetiDebt[] = []
    if (doLocalSave) {
      const debtInfos: any[] = JSON.parse(
        localStorage.getItem('yeti.debts') || '[]')
      for (const debtInfo of debtInfos) {
        debts.push(YetiDebt.fromExport(debtInfo))
      }
    } else {
      debts = [
        YetiDebt.randomDebt(),
        YetiDebt.randomDebt(),
        YetiDebt.randomDebt(),
      ]
    }

    this.state = {
      debts: debts,
      doLocalSave: doLocalSave,
      locale: navigator.language,
      payment: App.minimumPaymentForAllDebts(debts),
    } as AppState
  }

  static countryForLocale(locale: string): string {
    const matches = locale.match(/\-([a-z]{2,3})$/i)
    return matches[1] || locale
  }

  static findDebtByUid(debts: YetiDebt[], uid: string): YetiDebt {
    for (const debt of debts) {
      if (debt.uid == uid) {
        return debt
      }
    }
  }

  static minimumPaymentForAllDebts(debts: YetiDebt[]): number {
    let minimumPayment = 0

    // Add all the minimum payments.
    for (const debt of debts) {
      minimumPayment += debt.minimumPayment
    }

    return minimumPayment
  }

  handleAddDebt(_evt: any) {
    const debts = this.state.debts
    debts.push(YetiDebt.randomDebt())
    this.updateDebts(debts)
  }

  handleBorrowedInput(evt: any) {
    const target = findParentByClassname(evt.target, 'yeti__debt')
    const uid = target.dataset.debtUid
    const value = parseFloat(evt.target.value)
    const debt = App.findDebtByUid(this.state.debts, uid)
    debt.borrowed = Number.isNaN(value) ? 0 : value

    // Trigger a refresh of the state.
    this.updateDebts(this.state.debts)
  }

  handleLocalSaveToggle(_evt: any) {
    const doLocalSave = !this.state.doLocalSave
    this.setState({
      doLocalSave: doLocalSave
    })

    localStorage.setItem('yeti.save', String(doLocalSave))
    this.storeDebts(this.state.debts, doLocalSave)
  }

  handleMinimumPaymentInput(evt: any) {
    const target = findParentByClassname(evt.target, 'yeti__debt')
    const uid = target.dataset.debtUid
    const value = parseFloat(evt.target.value)
    const debt = App.findDebtByUid(this.state.debts, uid)
    debt.minimumPayment = Number.isNaN(value) ? 0 : value

    // Trigger a refresh of the state.
    this.updateDebts(this.state.debts)
  }

  handlePaymentInput(evt: any) {
    const value = parseFloat(evt.target.value)

    this.setState({
      payment: Math.max(
        value, App.minimumPaymentForAllDebts(this.state.debts))
    })
  }

  handleRateInput(evt: any) {
    const target = findParentByClassname(evt.target, 'yeti__debt')
    const uid = target.dataset.debtUid
    const value = parseFloat(evt.target.value)
    const debt = App.findDebtByUid(this.state.debts, uid)
    debt.rate = Number.isNaN(value) ? 0 : value

    // Trigger a refresh of the state.
    this.updateDebts(this.state.debts)
  }

  handleRemoveDebt(evt: any) {
    const target = findParentByClassname(evt.target, 'yeti__debt')
    const uid = target.dataset.debtUid
    const debts = this.state.debts.filter((debt) => debt.uid !== uid)
    this.updateDebts(debts)
  }

  render(props: AppProps, state: AppState) {
    const classes: string = [
      'yeti',
      `locale_${state.locale}`,
      `locale_country_${App.countryForLocale(state.locale)}`,
    ].join(' ')

    return (
      <div class={classes}>
        <Debts
          debts={state.debts}
          handleAddDebt={this.handleAddDebt.bind(this)}
          handleRemoveDebt={this.handleRemoveDebt.bind(this)}
          handleBorrowedInput={this.handleBorrowedInput.bind(this)}
          handleRateInput={this.handleRateInput.bind(this)}
          handleMinimumPaymentInput={this.handleMinimumPaymentInput.bind(this)} />
        <Payment
          payment={state.payment}
          handlePaymentInput={this.handlePaymentInput.bind(this)} />
        <Save
          doLocalSave={state.doLocalSave}
          handleLocalSaveToggle={this.handleLocalSaveToggle.bind(this)} />
        <PlanSuggested />
        <PlanPayoffTimeline />
        <PlanAccelerate />
        <PlanInterestChart />
        <PlanPicker />
        <PlanDetail />
      </div>
    )
  }

  storeDebts(debts: YetiDebt[], force: boolean = false) {
    if (this.state.doLocalSave || force) {
      const exportedDebts = []
      for (const debt of debts) {
        exportedDebts.push(debt.export())
      }
      localStorage.setItem('yeti.debts', JSON.stringify(exportedDebts))
      console.log(exportedDebts)
    }
  }

  updateDebts(debts: YetiDebt[]) {
    this.storeDebts(debts)
    this.setState({
      debts: debts,
      payment: Math.max(
        this.state.payment, App.minimumPaymentForAllDebts(debts)),
    })
  }
}
