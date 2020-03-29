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

    // 10% increase in payment.
    let accelerateExtra = props.strategyGroup.payment * .1

    // Round to the nearest 5.
    accelerateExtra = Math.round(accelerateExtra / 5) * 5

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
              <MarkupText id="repayment.accelerate.description" fields={fields} />
            </p>
          </div>
          <div class="yeti__flex__item">
            <div class="yeti__plan__grid yeti__plan__grid--three">
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.accelerate.additional" />
                </div>
                <div class="yeti__plan__grid__value">
                  {currencyFormat.format(accelerateExtra)}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.accelerate.interest" />
                </div>
                <div class="yeti__plan__grid__value">
                  {currencyFormat.format(Math.abs(strategyComparison.interest))}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.accelerate.time" />
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
