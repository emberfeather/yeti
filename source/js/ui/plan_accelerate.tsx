import { h, Component } from 'preact'


export interface PlanAccelerateProps {
}


export interface PlanAccelerateState {
}


export default class PlanAccelerate extends Component<PlanAccelerateProps, PlanAccelerateState> {
  constructor(props: PlanAccelerateProps) {
    super(props)

    this.state = {} as PlanAccelerateState
  }

  render(props: PlanAccelerateProps, state: PlanAccelerateState) {
    return (
      <div class="yeti__plan_accelerate card">
        accelerate!
      </div>
    )
  }
}
