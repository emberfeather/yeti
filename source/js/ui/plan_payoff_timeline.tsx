import { h, Component } from 'preact'


export interface PlanPayoffTimelineProps {
}


export interface PlanPayoffTimelineState {
}


export default class PlanPayoffTimeline extends Component<PlanPayoffTimelineProps, PlanPayoffTimelineState> {
  constructor(props: PlanPayoffTimelineProps) {
    super(props)

    this.state = {} as PlanPayoffTimelineState
  }

  render(props: PlanPayoffTimelineProps, state: PlanPayoffTimelineState) {
    // Ignore for now until we have a chart to show.
    return ''

    return (
      <div class="yeti__plan_payoff_timeline card">
        plan payoff timeline!
      </div>
    )
  }
}
