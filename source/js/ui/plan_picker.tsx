import { h, Component } from 'preact'
import { Text, MarkupText } from 'preact-i18n'


export interface PlanPickerProps {
}


export interface PlanPickerState {
}


export default class PlanPicker extends Component<PlanPickerProps, PlanPickerState> {
  constructor(props: PlanPickerProps) {
    super(props)

    this.state = {} as PlanPickerState
  }

  render(props: PlanPickerProps, state: PlanPickerState) {
    return (
      <div class="yeti__plan_picker card">
        <h2><Text id="repayment.plans.comparison" /></h2>
        <div class="yeti__grid yeti__grid--three">
          <div>
            <h3><Text id="plans.highest_interest.title" /></h3>
            <p><MarkupText id="plans.highest_interest.description" /></p>
            <p><MarkupText id="plans.highest_interest.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.lowest_balance.title" /></h3>
            <p><MarkupText id="plans.lowest_balance.description" /></p>
            <p><MarkupText id="plans.lowest_balance.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.balance_payment_ratio.title" /></h3>
            <p><MarkupText id="plans.balance_payment_ratio.description" /></p>
            <p><MarkupText id="plans.balance_payment_ratio.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.lowest_rate.title" /></h3>
            <p><MarkupText id="plans.lowest_rate.description" /></p>
            <p><MarkupText id="plans.lowest_rate.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.highest_balance.title" /></h3>
            <p><MarkupText id="plans.highest_balance.description" /></p>
            <p><MarkupText id="plans.highest_balance.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.balance_rate_ratio.title" /></h3>
            <p><MarkupText id="plans.balance_rate_ratio.description" /></p>
            <p><MarkupText id="plans.balance_rate_ratio.evaluation" /></p>
          </div>
        </div>
      </div>
    )
  }
}
