import { h, Component } from 'preact'
import { Text } from 'preact-i18n'


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
      <div class="yeti__payment card card--flush">
        <div class="fields">
          <div class="field">
            <div class="field__label">
              <label for="payment"><Text id="fields.payment.label" /></label>
            </div>
            <div class="field__input">
              <span class="input__currency"><input id="payment" type="number" min="0" step="0.01" value={props.payment.toFixed(2)} onInput={props.handlePaymentInput} class="input" /></span>
            </div>
            <div class="field__help">
              <Text id="fields.payment.help" />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
