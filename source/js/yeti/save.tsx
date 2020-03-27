import { h, Component } from 'preact'


export interface SaveProps {
}


export interface SaveState {
}


export default class Save extends Component<SaveProps, SaveState> {
  constructor(props: SaveProps) {
    super(props)

    this.state = {} as SaveState
  }

  render(props: SaveProps, state: SaveState) {
    return (
      <div class="yeti__save card">
        Save!
      </div>
    )
  }
}
