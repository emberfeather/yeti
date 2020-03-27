import { h, Component } from 'preact'


export interface DebtProps {
}


export interface DebtState {
}


export default class Debt extends Component<DebtProps, DebtState> {
  constructor(props: DebtProps) {
    super(props)

    this.state = {} as DebtState
  }

  render(props: DebtProps, state: DebtState) {
    return (
      <div class="yeti__debt card">
        debt!
      </div>
    )
  }
}
