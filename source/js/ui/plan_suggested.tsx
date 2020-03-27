import { h, Component } from 'preact'


export interface PlanSuggestedProps {
}


export interface PlanSuggestedState {
}


export default class PlanSuggested extends Component<PlanSuggestedProps, PlanSuggestedState> {
  constructor(props: PlanSuggestedProps) {
    super(props)

    this.state = {} as PlanSuggestedState
  }

  render(props: PlanSuggestedProps, state: PlanSuggestedState) {
    return (
      <div class="yeti__plan_suggested card">
        plan suggested!
      </div>
    )
  }
}
