import { h, Component } from 'preact'
import { Text, MarkupText } from 'preact-i18n'


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
          <Text id="save.label" />
        </div>
        <div class="yeti__help">
          <MarkupText id="save.help" />
        </div>
      </div>
    )
  }
}
