import { h, Component } from 'preact'
import { Text, MarkupText } from 'preact-i18n'


export interface PlanSuggestedProps {
  currency: string
  locale: string
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
    const fields = {
      amount: `${currencyFormat.format(40)}`,
      method: 'highest interest first',
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
                  {currencyFormat.format(-298)}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.overview.time" />
                </div>
                <div class="yeti__plan__grid__value">
                  <Text id="time.months" plural={-4} fields={{ months: -4 }} />
                </div>
              </div>
            </div>
          </div>
          <div class="yeti__flex__item">
            <p>
              <MarkupText id="plans.highest_interest.explanation" fields={fields} />
            </p>
          </div>
        </div>
      </div>
    )
  }
}
