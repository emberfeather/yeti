import { h, Component } from 'preact'


export interface DebtsProps {
}


export interface DebtsState {
}


export default class Debts extends Component<DebtsProps, DebtsState> {
  constructor(props: DebtsProps) {
    super(props)

    this.state = {} as DebtsState
  }

  render(props: DebtsProps, state: DebtsState) {
    return (
      <div class="yeti__debts">
        debts!
      </div>
    )
  }
}
