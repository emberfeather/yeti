import { h, Component } from 'preact'
import Debts from './debts'
import Payment from './payment'
import PlanAccelerate from './plan_accelerate'
import PlanDetail from './plan_detail'
import PlanInterestChart from './plan_interest_chart'
import PlanPayoffTimeline from './plan_payoff_timeline'
import PlanPicker from './plan_picker'
import PlanSuggested from './plan_suggested'
import Save from './save'


export interface AppProps {
}


export interface AppState {
}


export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.state = {} as AppState
  }

  render(props: AppProps, state: AppState) {
    return (
      <div class="yeti">
        <Debts />
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
