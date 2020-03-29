import { h, Component, Fragment } from 'preact'
import { Text } from 'preact-i18n'
import { STRATEGIES_ALL } from '../config'
import YetiStrategyGroup from '../yeti/strategyGroup'


export interface PlanComparisonProps {
  currency: string
  locale: string
  strategyGroup: YetiStrategyGroup
}


export interface PlanComparisonState {
}


export default class PlanComparison extends Component<PlanComparisonProps, PlanComparisonState> {
  constructor(props: PlanComparisonProps) {
    super(props)

    this.state = {} as PlanComparisonState
  }

  render(props: PlanComparisonProps, state: PlanComparisonState) {
    const currencyFormat = new Intl.NumberFormat(props.locale, {
      style: 'currency',
      currency: props.currency,
    })

    const cards = []

    for (const key of STRATEGIES_ALL) {
      cards.push({
        key: key,
        strategy: props.strategyGroup.strategies[key],
      })
    }

    return (
      <div class="yeti__plan_picker card">
        <h2><Text id="repayment.plans.comparison" /></h2>
        <div class="yeti__comparison__grid">
          <div class="yeti__comparison__grid__cell yeti__comparison__grid__title"></div>
          <div class="yeti__comparison__grid__cell yeti__comparison__grid__title"><Text id="repayment.total.spent" /></div>
          <div class="yeti__comparison__grid__cell yeti__comparison__grid__title"><Text id="repayment.total.time" /></div>

          {cards.map(card => (
            <Fragment key={card.key}>
              <div class="yeti__comparison__grid__cell yeti__comparison__grid__label">
                <Text id={`plans.${card.key}.title`} />
              </div>
              <div class="yeti__comparison__grid__cell">
                <div class="yeti__comparison__title">
                  <Text id="repayment.total.spent" />
                </div>
                <div class="yeti__comparison__value">
                  {currencyFormat.format(card.strategy.total)}
                </div>
              </div>
              <div class="yeti__comparison__grid__cell">
                <div class="yeti__comparison__title">
                  <Text id="repayment.total.time" />
                </div>
                <div class="yeti__comparison__value">
                  <Text id="time.months" plural={card.strategy.months} fields={{ months: card.strategy.months }} />
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    )
  }
}
