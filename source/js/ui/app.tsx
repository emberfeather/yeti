import { h, Component } from 'preact'
import { IntlProvider } from 'preact-i18n'
import YetiDebt from '../yeti/debt'
import StrategyGroup from '../yeti/strategyGroup'
import { strategies } from '../yeti/strategy'
import AutoLang from './lang_auto'
import Debts from './debts'
import LangSwitch from './lang_switch'
import Payment from './payment'
import PlanAccelerate from './plan_accelerate'
import PlanDetail from './plan_detail'
import PlanInterestChart from './plan_interest_chart'
import PlanPayoffTimeline from './plan_payoff_timeline'
import PlanPicker from './plan_picker'
import PlanSuggested from './plan_suggested'
import Save from './save'

import {
  BASE_STRATEGY,
  COUNTRY_TO_CURRENCY,
  DEFAULT_COUNTRY,
  DEFAULT_LANG,
} from '../config'
import { definitions } from '../i18n/i18n'
import { findParentByClassname } from '../utility/dom'


export interface AppProps {
}


export interface AppState {
  currency: string
  debts: YetiDebt[]
  definition: any
  doLocalSave: boolean
  lang: string
  locale: string
  payment: number
  strategyGroup: StrategyGroup
  strategyKey: string
}


export default class App extends Component<AppProps, AppState> {
  timeouts: any

  constructor(props: AppProps) {
    super(props)

    // Use for deferring update operations.
    this.timeouts = {}

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

    const lang:string = document.documentElement.lang
    const locale:string = navigator.language
    const currency:string = App.currencyForLocale(locale)
    const payment = App.minimumPaymentForAllDebts(debts)

    this.state = {
      currency: currency,
      debts: debts,
      definition: definitions[lang] || definitions[DEFAULT_LANG],
      doLocalSave: doLocalSave,
      lang: lang,
      locale: locale,
      payment: payment,
      strategyGroup: new StrategyGroup(strategies, BASE_STRATEGY, debts, payment),
      strategyKey: 'highestRate'
    } as AppState
  }

  static countryForLocale(locale: string): string {
    const matches = locale.match(/\-([a-z]{2,3})$/i)
    return matches[1] || locale
  }

  static currencyForLocale(locale: string): string {
    const country = App.countryForLocale(locale)
    return COUNTRY_TO_CURRENCY[country] || COUNTRY_TO_CURRENCY[DEFAULT_COUNTRY]
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
    if (this.timeouts.payment) {
      clearTimeout(this.timeouts.payment)
    }

    // Delay the update to prevent messing up what people are trying to type.
    this.timeouts.payment = setTimeout(() => {
      const value = parseFloat(evt.target.value)
      const newPayment = Math.max(
        value, App.minimumPaymentForAllDebts(this.state.debts))

      this.setState({
        payment: newPayment,
        strategyGroup: new StrategyGroup(strategies, BASE_STRATEGY, this.state.debts, newPayment),
      })
    }, 1000)
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
      <IntlProvider definition={state.definition}>
        <div class={classes}>
          <AutoLang lang={state.lang} locale={state.locale} />
          <Debts
            debts={state.debts}
            handleAddDebt={this.handleAddDebt.bind(this)}
            handleRemoveDebt={this.handleRemoveDebt.bind(this)}
            handleBorrowedInput={this.handleBorrowedInput.bind(this)}
            handleRateInput={this.handleRateInput.bind(this)}
            handleMinimumPaymentInput={this.handleMinimumPaymentInput.bind(this)} />
          <div class="yeti__grid yeti__grid--two">
            <Payment
              payment={state.payment}
              handlePaymentInput={this.handlePaymentInput.bind(this)} />
            <Save
              doLocalSave={state.doLocalSave}
              handleLocalSaveToggle={this.handleLocalSaveToggle.bind(this)} />
          </div>
          <PlanSuggested strategy={state.strategyGroup.strategies[state.strategyKey]} currency={state.currency} locale={state.locale} />
          <PlanPayoffTimeline />
          <PlanAccelerate currency={state.currency} locale={state.locale} />
          <PlanInterestChart />
          <PlanDetail strategy={state.strategyGroup.strategies[state.strategyKey]} currency={state.currency} locale={state.locale} />
          <PlanPicker currency={state.currency} locale={state.locale} />
          <LangSwitch lang={state.lang} />
        </div>
      </IntlProvider>
    )
  }

  storeDebts(debts: YetiDebt[], force: boolean = false) {
    if (this.state.doLocalSave || force) {
      const exportedDebts = []
      for (const debt of debts) {
        exportedDebts.push(debt.export())
      }
      localStorage.setItem('yeti.debts', JSON.stringify(exportedDebts))
    }
  }

  updateDebts(debts: YetiDebt[]) {
    this.storeDebts(debts)
    this.setState({
      debts: debts,
      payment: Math.max(
        this.state.payment, App.minimumPaymentForAllDebts(debts)),
      strategyGroup: new StrategyGroup(strategies, BASE_STRATEGY, debts, this.state.payment),
    })
  }
}
