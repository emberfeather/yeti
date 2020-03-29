import { h, Component, Fragment } from 'preact'
import { Text, MarkupText } from 'preact-i18n'
import { STRATEGIES_SUGGESTED } from '../config'
import YetiStrategyComparison from '../yeti/strategyComparison'


export interface PlanDetailProps {
  currency: string
  handleSwitchStrategy: any
  locale: string
  strategyComparison: YetiStrategyComparison
}


export interface PlanDetailState {
}


export default class PlanDetail extends Component<PlanDetailProps, PlanDetailState> {
  constructor(props: PlanDetailProps) {
    super(props)

    this.state = {} as PlanDetailState
  }

  render(props: PlanDetailProps, state: PlanDetailState) {
    const currencyFormat = new Intl.NumberFormat(props.locale, {
      style: 'currency',
      currency: props.currency,
    })
    const interestSaved = currencyFormat.format(Math.abs(props.strategyComparison.interest))
    const fields = {
      amount: interestSaved,
    }
    const otherStrategies = STRATEGIES_SUGGESTED.filter(
      strategyKey => strategyKey != props.strategyComparison.strategy.key)

    return (
      <div class="yeti__plan_detail card">
        <h2><Text id={`plans.${props.strategyComparison.strategy.key}.title`} /></h2>

        <div class="yeti__flex yeti__flex--two yeti__flex--center">
          <div class="yeti__flex__item">
            <div class="yeti__plan__grid">
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.overview.interest" />
                </div>
                <div class="yeti__plan__grid__value">
                  {interestSaved}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.overview.time" />
                </div>
                <div class="yeti__plan__grid__value">
                  <Text
                      id="time.months"
                      plural={props.strategyComparison.months}
                      fields={{ months: Math.abs(props.strategyComparison.months) }} />
                </div>
              </div>
            </div>
          </div>
          <div class="yeti__flex__item">
            <p>
              <MarkupText id={`plans.${props.strategyComparison.strategy.key}.explanation`} fields={fields} />
            </p>
          </div>
        </div>

        <div class="yeti__flex yeti__flex--three">
          <div class="yeti__flex__item">
            <p><Text id="repayment.order" /></p>
            <ol>
              {props.strategyComparison.strategy.debts.map(debt => (
                <li><RepaymentDetail amount={debt.borrowed} rate={debt.rate} currency={props.currency} locale={props.locale} /></li>
              ))}
            </ol>
          </div>
          <div class="yeti__flex__item">
            <p><MarkupText id={`plans.${props.strategyComparison.strategy.key}.description`} /></p>
            <p><MarkupText id={`plans.${props.strategyComparison.strategy.key}.evaluation`} /></p>
          </div>
        </div>

        <h3>Other Strategies</h3>
        <div class="button__list">
        {otherStrategies.map(strategyKey => (
          <Fragment key={strategyKey}>
            <button
                class="button button--secondary yeti__strategy"
                data-strategy-key={strategyKey}
                onClick={props.handleSwitchStrategy}>
              <Text id={`plans.${strategyKey}.title`} />
            </button>
          </Fragment>
        ))}
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
