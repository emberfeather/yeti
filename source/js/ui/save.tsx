import { h, Component } from 'preact'


export interface SaveProps {
  doLocalSave: boolean
  handleLocalSaveToggle: any
}


export interface SaveState {
}


export default class Save extends Component<SaveProps, SaveState> {
  constructor(props: SaveProps) {
    super(props)

    this.state = {} as SaveState
  }

  render(props: SaveProps, state: SaveState) {
    const toggleClassList: string[] = [
      'toggle',
    ]

    if (props.doLocalSave) {
      toggleClassList.push('toggle--checked')
    }

    const toggleClasses = toggleClassList.join(' ')

    return (
      <div class="yeti__save card">
        <div class="input__toggle" onClick={props.handleLocalSaveToggle}>
          <div class={toggleClasses}></div>
          Save for later.
        </div>
        <div class="yeti__help">
          Stores the debt and repayment information locally for your next visit.
        </div>
      </div>
    )
  }
}
