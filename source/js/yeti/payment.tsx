import { h, Component } from 'preact'


export interface PaymentProps {
}


export interface PaymentState {
}


export default class Payment extends Component<PaymentProps, PaymentState> {
  constructor(props: PaymentProps) {
    super(props)

    this.state = {} as PaymentState
  }

  render(props: PaymentProps, state: PaymentState) {
    return (
      <div class="yeti__payment card">
        payment!
      </div>
    )
  }
}
