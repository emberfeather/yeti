import { h, Component } from 'preact'
import { Text, MarkupText } from 'preact-i18n'


export interface PlanAccelerateProps {
  currency: string
  locale: string
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
    const fields = {
      extra: `${currencyFormat.format(40)}`,
      saved: `${currencyFormat.format(400)}`,
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
                  {currencyFormat.format(100)}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.overview.interest" />
                </div>
                <div class="yeti__plan__grid__value">
                  {currencyFormat.format(-100)}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.overview.time" />
                </div>
                <div class="yeti__plan__grid__value">
                  <Text id="time.months" plural={-2} fields={{ months: -2 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
