import { h, Component } from 'preact'


export interface PlanAccelerateProps {
}


export interface PlanAccelerateState {
}


export default class PlanAccelerate extends Component<PlanAccelerateProps, PlanAccelerateState> {
  constructor(props: PlanAccelerateProps) {
    super(props)

    this.state = {} as PlanAccelerateState
  }

  render(props: PlanAccelerateProps, state: PlanAccelerateState) {
    return (
      <div class="yeti__plan_accelerate card">
        <div class="yeti__flex yeti__flex--two yeti__flex--center">
          <div class="yeti__flex__item">
            <div class="yeti__plan__grid yeti__plan__grid--three">
              <div class="yeti__plan__grid__cell">
                <div class="yeti__plan__grid__label">
                  Additional
                </div>
                <div class="yeti__plan__grid__value">
                  +$xx.xx
                </div>
              </div>
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
                  -2 months
                </div>
              </div>
            </div>
          </div>
          <div class="yeti__flex__item">
            <p>
              Add <strong>$40 more each month</strong> to paying off debts and
              save an <strong>additional $xx.xx</strong> in interest and
              use <strong>2 months less time</strong>.
            </p>
          </div>
        </div>
      </div>
    )
  }
}
