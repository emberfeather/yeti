import { h, Component } from 'preact'


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
        <div class="yeti__grid yeti__grid--three">
          <div>
            <h3>Highest Interest First</h3>
            <p>
              By paying off the loans with the highest interest rate first you end
              up paying less in interest in total.
            </p>
            <p>
              This will <strong>save the most money</strong>, but may be the <strong>most mentally and
              emotionally challenging</strong> to execute since it usually takes longer to feel
              like it is having any effect.
            </p>
          </div>
          <div>
            <h3>Lowest Balance</h3>
            <p>
              By paying off loans with the lowest balance first you can <strong>increase your snowball quickly</strong>.
            </p>
            <p>
              This is one of the most commonly promoted strategies and often is <strong>easier mentally and emotionally to execute</strong> since you are able to build momentum quickly and feel good about the progress you make.
            </p>
          </div>
          <div>
            <h3>Balance/Minimum Payment Ratio</h3>
            <p>
              Attempts to find debts that will be <strong>easy to pay off</strong> and <strong>add quickly to your snowball</strong>.
            </p>
            <p>
              This is a preferred strategy as it can be <strong>mentally and emotionally easier</strong> than the Highest Interest Rate strategy and usually quicker than the Lowest Balance strategy.
            </p>
          </div>
          <div>
            <h3>Lowest Interest Rate</h3>
            <p>
              This is calculated as a <strong>counter-point to the Highest Interest Rate strategy</strong> to show how much of a difference the order of repayment makes.
            </p>
          </div>
          <div>
            <h3>Highest Balance</h3>
            <p>
              This is calculated as a <strong>counter-point to the Lowest Balance strategy</strong> to show how much of a difference the order of repayment makes.
            </p>
          </div>
          <div>
            <h3>Balance/Interest Rate Ratio</h3>
            <p>
              Attempts to find debts that will be <strong>easy to pay off</strong> and <strong>add quickly to your snowball</strong>.
            </p>
            <p>
              This is a preferred strategy as if can be <strong>mentally and emotionally easier</strong> than the Highest Interest Rate strategy and quicker than the Lowest Balance strategy.
            </p>
          </div>
        </div>
      </div>
    )
  }
}
