import { h, Component } from 'preact'
import { Text } from 'preact-i18n'
import YetiDebt from '../yeti/debt'


export interface DebtProps {
  debt?: YetiDebt
  handleBorrowedInput: any
  handleMinimumPaymentInput: any
  handleRateInput: any
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
      <div class="yeti__debt card card--flush" data-debt-uid={props.debt.uid}>
        <div class="actions__wrapper">
          <div class="fields">
            <div class="field">
              <div class="field__label">
                <label for={`borrowed_${props.debt.uid}`}><Text id="fields.borrowed.label" /></label>
              </div>
              <div class="field__input">
                <span class="input__currency"><input id={`borrowed_${props.debt.uid}`} type="number" min="0" step="0.01" value={props.debt.borrowed} onChange={props.handleBorrowedInput} class="input" /></span>
              </div>
              <div class="field__help">
                <Text id="fields.borrowed.help" />
              </div>
            </div>
            <div class="field">
              <div class="field__label">
                <label for={`rate_${props.debt.uid}`}><Text id="fields.rate.label" /></label>
              </div>
              <div class="field__input">
                <span class="input__rate"><input id={`rate_${props.debt.uid}`} type="number" min="0" max="100" step="0.001" value={props.debt.rate} onChange={props.handleRateInput} class="input" /></span>
              </div>
              <div class="field__help">
                <Text id="fields.rate.help" />
              </div>
            </div>
            <div class="field">
              <div class="field__label">
                <label for={`minimum_payment_${props.debt.uid}`}><Text id="fields.minimumPayment.label" /></label>
              </div>
              <div class="field__input">
                <span class="input__currency"><input id={`minimum_payment_${props.debt.uid}`} type="number" min="0" step="0.01" value={props.debt.minimumPayment} onChange={props.handleMinimumPaymentInput} class="input" /></span>
              </div>
              <div class="field__help">
                <Text id="fields.minimumPayment.help" />
              </div>
            </div>
          </div>
          <div class="actions">
            <button class="button button--subtle" title="Remove debt" onClick={props.handleRemoveDebt}>X</button>
          </div>
        </div>
      </div>
    )
  }
}
