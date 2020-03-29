import { h, Component, Fragment } from 'preact'
import { Text } from 'preact-i18n'
import { BASE_STRATEGY, STRATEGIES_ALL } from '../config'
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
        comparison: props.strategyGroup.compare(key),
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
                  {BASE_STRATEGY == card.key ? currencyFormat.format(card.strategy.total) : (
                    <Fragment key={`${card.key}-total`}>
                      <div class="yeti__comparison__value__total">
                        {currencyFormat.format(card.strategy.total)}
                      </div>
                      <div class="yeti__comparison__value__compare">
                        {currencyFormat.format(card.comparison.total)}
                      </div>
                    </Fragment>
                  )}
                </div>
              </div>
              <div class="yeti__comparison__grid__cell">
                <div class="yeti__comparison__title">
                  <Text id="repayment.total.time" />
                </div>
                <div class="yeti__comparison__value">
                  {BASE_STRATEGY == card.key ? <Text id="time.months" plural={card.strategy.months} fields={{ months: card.strategy.months }} /> : (
                    <Fragment key={`${card.key}-months`}>
                      <div class="yeti__comparison__value__total">
                        <Text id="time.months" plural={card.strategy.months} fields={{ months: card.strategy.months }} />
                      </div>
                      <div class="yeti__comparison__value__compare">
                        <Text id="time.months" plural={card.comparison.months} fields={{ months: card.comparison.months }} />
                      </div>
                    </Fragment>
                  )}

                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    )
  }
}
