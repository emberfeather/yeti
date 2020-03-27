import { h, Component } from 'preact'


export interface PlanSuggestedProps {
}


export interface PlanSuggestedState {
}


export default class PlanSuggested extends Component<PlanSuggestedProps, PlanSuggestedState> {
  constructor(props: PlanSuggestedProps) {
    super(props)

    this.state = {} as PlanSuggestedState
  }

  render(props: PlanSuggestedProps, state: PlanSuggestedState) {
    return (
      <div class="yeti__plan_suggested card">
        <div class="yeti__flex yeti__flex--two yeti__flex--center">
          <div class="yeti__flex__item">
            <div class="yeti__plan__grid">
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  Interest
                </div>
                <div class="yeti__plan__grid__value">
                  -$xxx.xx
                </div>
              </div>
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  Time
                </div>
                <div class="yeti__plan__grid__value">
                  -4 months
                </div>
              </div>
            </div>
          </div>
          <div class="yeti__flex__item">
            <p>
              Snowballing your debts to pay off <strong>the highest interest debt
              first</strong> will spend <strong>$xxx.xx less in interest</strong> and
              pay off all debts <strong>4 months faster</strong> than paying only
              minimum payments.
            </p>
          </div>
        </div>
      </div>
    )
  }
}
