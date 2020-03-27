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
  locale: string
}


export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.state = {
      debts: [
        YetiDebt.randomDebt(),
      ],
      locale: navigator.language,
    } as AppState
  }

  static countryForLocale(locale: string): string {
    const matches = locale.match(/\-([a-z]{2,3})$/i)
    return matches[1] || locale
  }

  handleAddDebt(_evt: any) {
    const debts = this.state.debts
    debts.push(YetiDebt.randomDebt())
    this.setState({
      debts: debts,
    })
  }

  handleRemoveDebt(evt: any) {
    const target = findParentByClassname(evt.target, 'yeti__debt')
    const uid = target.dataset.debtUid
    const debts = this.state.debts
    this.setState({
      debts: debts.filter((debt) => debt.uid !== uid),
    })
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
          handleRemoveDebt={this.handleRemoveDebt.bind(this)} />
        <Save />
        <Payment />
        <PlanSuggested />
        <PlanPayoffTimeline />
        <PlanAccelerate />
        <PlanInterestChart />
        <PlanPicker />
        <PlanDetail />
      </div>
    )
  }
}
