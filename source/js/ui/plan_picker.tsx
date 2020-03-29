import { h, Component } from 'preact'
import { Text, MarkupText } from 'preact-i18n'
import YetiStrategyGroup from '../yeti/strategyGroup'


export interface PlanPickerProps {
  currency: string
  locale: string
  strategyGroup: YetiStrategyGroup
}


export interface PlanPickerState {
}


export default class PlanPicker extends Component<PlanPickerProps, PlanPickerState> {
  constructor(props: PlanPickerProps) {
    super(props)

    this.state = {} as PlanPickerState
  }

  render(props: PlanPickerProps, state: PlanPickerState) {
    const currencyFormat = new Intl.NumberFormat(props.locale, {
      style: 'currency',
      currency: props.currency,
    })

    const cards = []

    for (const key of [
        'highestRate', 'lowestBalance', 'balancePaymentRatio',
        'lowestRate', 'highestBalance' ,'balanceRateRatio']) {
      cards.push({
        key: key,
        strategy: props.strategyGroup.strategies[key],
      })
    }

    return (
      <div class="yeti__plan_picker card">
        <h2><Text id="repayment.plans.comparison" /></h2>
        <div class="yeti__grid yeti__grid--three">
          {cards.map(card => (
            <div>
              <h3><Text id={`plans.${card.key}.title`} /></h3>
              <div class="yeti__plan__grid">
                <div class="yeti__plan__grid__cell">
                  <div class="yeti__plan__grid__label">
                    <Text id="repayment.total.spent" />
                  </div>
                  <div class="yeti__plan__grid__value">
                    {currencyFormat.format(card.strategy.total)}
                  </div>
                </div>
                <div class="yeti__plan__grid__cell">
                  <div class="yeti__plan__grid__label">
                    <Text id="repayment.total.time" />
                  </div>
                  <div class="yeti__plan__grid__value">
                    <Text id="time.months" plural={card.strategy.months} fields={{ months: card.strategy.months }} />
                  </div>
                </div>
              </div>
              <p><MarkupText id={`plans.${card.key}.description`} /></p>
              <p><MarkupText id={`plans.${card.key}.evaluation`} /></p>
            </div>
          ))}
        </div>
      </div>
    )
  }
}
