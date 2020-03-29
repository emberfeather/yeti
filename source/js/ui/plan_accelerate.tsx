import { h, Component } from 'preact'
import { Text, MarkupText } from 'preact-i18n'
import YetiStrategyComparison from '../yeti/strategyComparison'
import YetiStrategyGroup from '../yeti/strategyGroup'


export interface PlanAccelerateProps {
  currency: string
  locale: string
  strategyGroup: YetiStrategyGroup
  strategyKey: string
}


export interface PlanAccelerateState {
}


export default class PlanAccelerate extends Component<PlanAccelerateProps, PlanAccelerateState> {
  constructor(props: PlanAccelerateProps) {
    super(props)

    this.state = {} as PlanAccelerateState
  }

  render(props: PlanAccelerateProps, state: PlanAccelerateState) {
    const currencyFormat = new Intl.NumberFormat(props.locale, {
      style: 'currency',
      currency: props.currency,
    })

    const accelerateExtra = 25
    const strategy = props.strategyGroup.strategies[props.strategyKey]
    const acceleratedStrategy = props.strategyGroup.accelerate(props.strategyKey, accelerateExtra)
    const strategyComparison = new YetiStrategyComparison(strategy, acceleratedStrategy)
    const fields = {
      extra: `${currencyFormat.format(accelerateExtra)}`,
      saved: `${currencyFormat.format(strategyComparison.interest)}`,
    }

    return (
      <div class="yeti__plan_accelerate card">
        <div class="yeti__flex yeti__flex--two yeti__flex--center">
          <div class="yeti__flex__item">
            <p>
              <MarkupText id="repayment.accelerate" fields={fields} />
            </p>
          </div>
          <div class="yeti__flex__item">
            <div class="yeti__plan__grid yeti__plan__grid--three">
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.overview.additional" />
                </div>
                <div class="yeti__plan__grid__value">
                  {currencyFormat.format(accelerateExtra)}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.overview.interest" />
                </div>
                <div class="yeti__plan__grid__value">
                  {currencyFormat.format(Math.abs(strategyComparison.interest))}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.overview.time" />
                </div>
                <div class="yeti__plan__grid__value">
                  <Text id="time.months" plural={strategyComparison.months} fields={{ months: strategyComparison.months * -1 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
