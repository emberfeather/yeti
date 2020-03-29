import { h, Component } from 'preact'


export interface PlanInterestChartProps {
}


export interface PlanInterestChartState {
}


export default class PlanInterestChart extends Component<PlanInterestChartProps, PlanInterestChartState> {
  constructor(props: PlanInterestChartProps) {
    super(props)

    this.state = {} as PlanInterestChartState
  }

  render(props: PlanInterestChartProps, state: PlanInterestChartState) {
    // Ignore for now until we have a chart to show.
    return ''

    return (
      <div class="yeti__plan_interest_chart card">
        plan interest chart!
      </div>
    )
  }
}
