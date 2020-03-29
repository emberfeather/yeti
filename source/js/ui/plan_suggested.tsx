import { h, Component } from 'preact'
import { Text, MarkupText } from 'preact-i18n'
import YetiStrategyComparison from '../yeti/strategyComparison'


export interface PlanSuggestedProps {
  currency: string
  locale: string
  strategyComparison: YetiStrategyComparison
}


export interface PlanSuggestedState {
}


export default class PlanSuggested extends Component<PlanSuggestedProps, PlanSuggestedState> {
  constructor(props: PlanSuggestedProps) {
    super(props)

    this.state = {} as PlanSuggestedState
  }

  render(props: PlanSuggestedProps, state: PlanSuggestedState) {
    const currencyFormat = new Intl.NumberFormat(props.locale, {
      style: 'currency',
      currency: props.currency,
    })
    const interestSaved = currencyFormat.format(props.strategyComparison.interest)
    const fields = {
      amount: interestSaved,
    }

    return (
      <div class="yeti__plan_suggested card">
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
                      fields={{ months: props.strategyComparison.months }} />
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
      </div>
    )
  }
}
