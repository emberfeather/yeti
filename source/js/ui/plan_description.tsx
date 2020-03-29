import { h, Component } from 'preact'
import { Text, MarkupText } from 'preact-i18n'
import { STRATEGIES_SUGGESTED } from '../config'


export interface PlanDescriptionProps {
}


export interface PlanDescriptionState {
}


export default class PlanDescription extends Component<PlanDescriptionProps, PlanDescriptionState> {
  constructor(props: PlanDescriptionProps) {
    super(props)

    this.state = {} as PlanDescriptionState
  }

  render(props: PlanDescriptionProps, state: PlanDescriptionState) {
    const cards = []

    for (const key of STRATEGIES_SUGGESTED) {
      cards.push({
        key: key,
      })
    }

    return (
      <div class="yeti__plan_picker card">
        <h2><Text id="repayment.plans.descriptions" /></h2>
        <div class="yeti__grid yeti__grid--three">
          {cards.map(card => (
            <div>
              <h3><Text id={`plans.${card.key}.title`} /></h3>
              <p><MarkupText id={`plans.${card.key}.description`} /></p>
              <p><MarkupText id={`plans.${card.key}.evaluation`} /></p>
            </div>
          ))}
        </div>
      </div>
    )
  }
}
