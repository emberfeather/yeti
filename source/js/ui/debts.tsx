import { h, Component } from 'preact'
import YetiDebt from '../yeti/debt'
import Debt from './debt'


export interface DebtsProps {
  debts?: YetiDebt[]
  handleAddDebt: any
  handleBorrowedInput: any
  handleMinimumPaymentInput: any
  handleRateInput: any
  handleRemoveDebt: any
}


export interface DebtsState {
}


export default class Debts extends Component<DebtsProps, DebtsState> {
  constructor(props: DebtsProps) {
    super(props)

    this.state = {} as DebtsState
  }

  render(props: DebtsProps, _state: DebtsState) {
    const showAdd:boolean = props.debts.length < 20

    return (
      <div class="yeti__debts">
        {props.debts.map(debt => (
          <Debt
            debt={debt}
            handleBorrowedInput={props.handleBorrowedInput}
            handleMinimumPaymentInput={props.handleMinimumPaymentInput}
            handleRateInput={props.handleRateInput}
            handleRemoveDebt={props.handleRemoveDebt} />
        ))}

        {!showAdd ? '' :
          <div class="card card--actions">
            <button class="button--primary" onClick={props.handleAddDebt}>Add Debt</button>
          </div>}
      </div>
    )
  }
}
