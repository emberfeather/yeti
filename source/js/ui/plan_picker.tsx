import { h, Component } from 'preact'
import { Text, MarkupText } from 'preact-i18n'


export interface PlanPickerProps {
  currency: string
  locale: string
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

    return (
      <div class="yeti__plan_picker card">
        <h2><Text id="repayment.plans.comparison" /></h2>
        <div class="yeti__grid yeti__grid--three">
          <div>
            <h3><Text id="plans.highest_interest.title" /></h3>
            <div class="yeti__plan__grid">
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.total.spent" />
                </div>
                <div class="yeti__plan__grid__value">
                  {currencyFormat.format(12098)}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.total.time" />
                </div>
                <div class="yeti__plan__grid__value">
                  <Text id="time.months" plural={15} fields={{ months: 15 }} />
                </div>
              </div>
            </div>
            <p><MarkupText id="plans.highest_interest.description" /></p>
            <p><MarkupText id="plans.highest_interest.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.lowest_balance.title" /></h3>
            <div class="yeti__plan__grid">
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.total.spent" />
                </div>
                <div class="yeti__plan__grid__value">
                  {currencyFormat.format(12098)}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.total.time" />
                </div>
                <div class="yeti__plan__grid__value">
                  <Text id="time.months" plural={15} fields={{ months: 15 }} />
                </div>
              </div>
            </div>
            <p><MarkupText id="plans.lowest_balance.description" /></p>
            <p><MarkupText id="plans.lowest_balance.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.balance_payment_ratio.title" /></h3>
            <div class="yeti__plan__grid">
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.total.spent" />
                </div>
                <div class="yeti__plan__grid__value">
                  {currencyFormat.format(12098)}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.total.time" />
                </div>
                <div class="yeti__plan__grid__value">
                  <Text id="time.months" plural={15} fields={{ months: 15 }} />
                </div>
              </div>
            </div>
            <p><MarkupText id="plans.balance_payment_ratio.description" /></p>
            <p><MarkupText id="plans.balance_payment_ratio.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.lowest_rate.title" /></h3>
            <div class="yeti__plan__grid">
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.total.spent" />
                </div>
                <div class="yeti__plan__grid__value">
                  {currencyFormat.format(12098)}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.total.time" />
                </div>
                <div class="yeti__plan__grid__value">
                  <Text id="time.months" plural={15} fields={{ months: 15 }} />
                </div>
              </div>
            </div>
            <p><MarkupText id="plans.lowest_rate.description" /></p>
            <p><MarkupText id="plans.lowest_rate.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.highest_balance.title" /></h3>
            <div class="yeti__plan__grid">
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.total.spent" />
                </div>
                <div class="yeti__plan__grid__value">
                  {currencyFormat.format(12098)}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.total.time" />
                </div>
                <div class="yeti__plan__grid__value">
                  <Text id="time.months" plural={15} fields={{ months: 15 }} />
                </div>
              </div>
            </div>
            <p><MarkupText id="plans.highest_balance.description" /></p>
            <p><MarkupText id="plans.highest_balance.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.balance_rate_ratio.title" /></h3>
            <div class="yeti__plan__grid">
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.total.spent" />
                </div>
                <div class="yeti__plan__grid__value">
                  {currencyFormat.format(12098)}
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  <Text id="repayment.total.time" />
                </div>
                <div class="yeti__plan__grid__value">
                  <Text id="time.months" plural={15} fields={{ months: 15 }} />
                </div>
              </div>
            </div>
            <p><MarkupText id="plans.balance_rate_ratio.description" /></p>
            <p><MarkupText id="plans.balance_rate_ratio.evaluation" /></p>
          </div>
        </div>
      </div>
    )
  }
}
