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
        plan picker!
      </div>
    )
  }
}
