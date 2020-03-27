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
    return (
      <div class="yeti__plan_payoff_timeline card">
        plan payoff timeline!
      </div>
    )
  }
}
