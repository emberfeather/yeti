import { h, Component } from 'preact'
import YetiDebt from '../yeti/debt'


export interface DebtProps {
  debt?: YetiDebt
  handleRemoveDebt: any
}


export interface DebtState {
}


export default class Debt extends Component<DebtProps, DebtState> {
  constructor(props: DebtProps) {
    super(props)

    this.state = {} as DebtState
  }

  render(props: DebtProps, _state: DebtState) {
    return (
      <div class="yeti__debt card" data-debt-uid={props.debt.uid}>
        <div class="actions__wrapper">
          <p>
            Borrowed <span class="input__currency"><input type="number" step="0.01" value={props.debt.borrowed.toFixed(2)} class="input input--inline input--currency" /></span>
            at
            <span class="input__rate"><input type="number" step="0.001" value={props.debt.rate.toFixed(3)} class="input input--inline input--rate" /></span>
            interest with a
            <span class="input__currency"><input type="number" step="0.01" value={props.debt.minimumPayment.toFixed(2)} class="input input--inline input--currency" /></span>
            minimum monthly payment.
          </p>
          <div class="actions">
            <button title="Remove" onClick={props.handleRemoveDebt}>X</button>
          </div>
        </div>
      </div>
    )
  }
}
