import { h, Component } from 'preact'


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
        plan details!!
      </div>
    )
  }
}
