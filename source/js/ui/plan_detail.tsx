import { h, Component } from 'preact'
import { Text } from 'preact-i18n'


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
        <h2><Text id="plans.highest_interest_first.title">Highest Interest First</Text></h2>
        <div class="yeti__flex yeti__flex--three">
          <div class="yeti__flex__item">
            <p>Payoff order:</p>
            <ol>
              <li>$12261 @ 18.02% </li>
              <li>$10232 @ 14.53%</li>
              <li>$8729 @ 17.85%</li>
            </ol>
          </div>
          <div class="yeti__flex__item">
            <p>
              By paying off the loans with the highest interest rate first you end
              up paying less in interest in total.
            </p>
            <p>
              This will save the most money, but may be the most mentally and
              emotionally challenging to execute since it usually takes longer to feel
              like it is having any effect.
            </p>
          </div>
        </div>
      </div>
    )
  }
}
