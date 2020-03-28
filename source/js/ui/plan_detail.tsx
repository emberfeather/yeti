import { h, Component } from 'preact'
import { Text, MarkupText } from 'preact-i18n'
import { BaseYetiStrategy } from '../yeti/strategy'


export interface PlanDetailProps {
  currency: string
  locale: string
  strategy: BaseYetiStrategy
}


export interface PlanDetailState {
}


export default class PlanDetail extends Component<PlanDetailProps, PlanDetailState> {
  constructor(props: PlanDetailProps) {
    super(props)

    this.state = {} as PlanDetailState
  }

  render(props: PlanDetailProps, state: PlanDetailState) {
    return (
      <div class="yeti__plan_detail card">
        <h2><Text id={`plans.${props.strategy.key}.title`} /></h2>
        <div class="yeti__flex yeti__flex--three">
          <div class="yeti__flex__item">
            <p><Text id="repayment.order" /></p>
            <ol>
              {props.strategy.debts.map(debt => (
                <li><RepaymentDetail amount={debt.borrowed} rate={debt.rate} currency={props.currency} locale={props.locale} /></li>
              ))}
            </ol>
          </div>
          <div class="yeti__flex__item">
            <p><MarkupText id={`plans.${props.strategy.key}.description`} /></p>
            <p><MarkupText id={`plans.${props.strategy.key}.evaluation`} /></p>
          </div>
        </div>
      </div>
    )
  }
}


export interface RepaymentDetailProps {
  amount: number
  currency: string
  locale: string
  rate: number
}


export interface RepaymentDetailState {
}


export class RepaymentDetail extends Component<RepaymentDetailProps, RepaymentDetailState> {
  constructor(props: RepaymentDetailProps) {
    super(props)

    this.state = {} as RepaymentDetailState
  }

  render(props: RepaymentDetailProps, state: RepaymentDetailState) {
    const currencyFormat = new Intl.NumberFormat(props.locale, {
      style: 'currency',
      currency: props.currency,
    })
    const numberFormat = new Intl.NumberFormat(props.locale)
    const fields = {
      'amount': currencyFormat.format(props.amount),
      'rate': numberFormat.format(props.rate),
    }

    return (
      <Text id="repayment.abbrevation" fields={fields} />
    )
  }
}
