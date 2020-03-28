import { h, Component } from 'preact'
import { Text, MarkupText } from 'preact-i18n'


export interface PlanDetailProps {
}


export interface PlanDetailState {
}


export default class PlanDetail extends Component<PlanDetailProps, PlanDetailState> {
  constructor(props: PlanDetailProps) {
    super(props)

    this.state = {} as PlanDetailState
  }

  render(props: PlanDetailProps, state: PlanDetailState) {
    return (
      <div class="yeti__plan_detail card">
        <h2><Text id="plans.highest_interest.title" /></h2>
        <div class="yeti__flex yeti__flex--three">
          <div class="yeti__flex__item">
            <p><Text id="repayment.order" /></p>
            <ol>
              <li>$12261 @ 18.02% </li>
              <li>$10232 @ 14.53%</li>
              <li>$8729 @ 17.85%</li>
            </ol>
          </div>
          <div class="yeti__flex__item">
            <p><MarkupText id="plans.highest_interest.description" /></p>
            <p><MarkupText id="plans.highest_interest.evaluation" /></p>
          </div>
        </div>
      </div>
    )
  }
}
