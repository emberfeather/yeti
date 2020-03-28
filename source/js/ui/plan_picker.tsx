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
            <h3><Text id="plans.highestRate.title" /></h3>
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
            <p><MarkupText id="plans.highestRate.description" /></p>
            <p><MarkupText id="plans.highestRate.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.lowestBalance.title" /></h3>
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
            <p><MarkupText id="plans.lowestBalance.description" /></p>
            <p><MarkupText id="plans.lowestBalance.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.balancePaymentRatio.title" /></h3>
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
            <p><MarkupText id="plans.balancePaymentRatio.description" /></p>
            <p><MarkupText id="plans.balancePaymentRatio.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.lowestRate.title" /></h3>
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
            <p><MarkupText id="plans.lowestRate.description" /></p>
            <p><MarkupText id="plans.lowestRate.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.highestBalance.title" /></h3>
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
            <p><MarkupText id="plans.highestBalance.description" /></p>
            <p><MarkupText id="plans.highestBalance.evaluation" /></p>
          </div>
          <div>
            <h3><Text id="plans.balanceRateRatio.title" /></h3>
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
            <p><MarkupText id="plans.balanceRateRatio.description" /></p>
            <p><MarkupText id="plans.balanceRateRatio.evaluation" /></p>
          </div>
        </div>
      </div>
    )
  }
}
