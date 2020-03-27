import { h, Component } from 'preact'


export interface PaymentProps {
  handlePaymentInput: any
  payment: number
}


export interface PaymentState {
}


export default class Payment extends Component<PaymentProps, PaymentState> {
  constructor(props: PaymentProps) {
    super(props)

    this.state = {} as PaymentState
  }

  render(props: PaymentProps, _state: PaymentState) {
    return (
      <div class="yeti__payment card">
        <p>
          Each month
          <span class="input__currency"><input type="number" step="0.01" value={props.payment.toFixed(2)} onInput={props.handlePaymentInput} class="input input--inline input--currency" /></span>
          is available to pay off all debts.
        </p>
      </div>
    )
  }
}
