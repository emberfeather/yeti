import { h, Component } from 'preact'
import { Text, MarkupText } from 'preact-i18n'


export interface PaymentProps {
  currency: string
  handlePaymentInput: any
  locale: string
  minimumPayment: number
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
    const currencyFormat = new Intl.NumberFormat(props.locale, {
      style: 'currency',
      currency: props.currency,
    })
    const fields = {
      extra: `${currencyFormat.format(props.payment - props.minimumPayment)}`,
    }

    return (
      <div class="yeti__payment card card--flush">
        <div class="fields">
          <div class="field">
            <div class="field__label">
              <label for="payment"><Text id="fields.payment.label" /></label>
            </div>
            <div class="field__input">
              <span class="input__currency"><input id="payment" type="number" min="0" step="0.01" value={props.payment.toFixed(2)} onInput={props.handlePaymentInput} class="input" /></span>
              <span class="field__aside"><MarkupText id="repayment.over" fields={fields} /></span>
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
