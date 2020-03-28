import { h, Component } from 'preact'
import { MarkupText } from 'preact-i18n'
// TODO: Get scoped provider to work.
// import { IntlProvider, MarkupText } from 'preact-i18n'


import { AVAILABLE_LANGS, DEFAULT_LANG } from '../config'
import { definitions } from '../i18n/i18n'
import { findParentByClassname } from '../utility/dom'


export interface AutoLangProps {
  lang: string
  locale: string
}


export interface AutoLangState {
}


export default class AutoLang extends Component<AutoLangProps, AutoLangState> {
  constructor(props: AutoLangProps) {
    super(props)

    this.state = {} as AutoLangState
  }

  handleAutoLangSwitch(evt: any) {
    const target = findParentByClassname(evt.target, 'yeti__lang__switch')
    const lang = target.dataset.lang

    if (lang == DEFAULT_LANG) {
      window.location.href = '/'
    } else if (AVAILABLE_LANGS.includes(lang)) {
      window.location.href = `/${lang}/`
    }
  }

  render(props: AutoLangProps, state: AutoLangState) {
    const browserLang = props.locale.split('-')[0]

    if (browserLang == props.lang || !AVAILABLE_LANGS.includes(browserLang)) {
      return ''
    }

    const browserDefinition = definitions[browserLang]
    const fields = {
      'origin': browserDefinition.lang.languages[props.lang],
      'destination': browserDefinition.lang.languages[browserLang],
    }

    // TODO: Get scoped provider to work.
    // return (
    //   <div class="yeti__lang card">
    //     <div class="yeti__lang__switch" data-lang={browserLang} onClick={this.handleAutoLangSwitch}>
    //       <IntlProvider scope="auto" definition={definitions[browserLang]}>
    //         <MarkupText id="lang.switch" fields={fields} />
    //       </IntlProvider>
    //     </div>
    //   </div>
    // )

    // TODO: Remove when scoped provider works.
    let switchText = browserDefinition.lang.switch
    switchText = switchText.replace('{{origin}}', fields.origin)
    switchText = switchText.replace('{{destination}}', fields.destination)

    return (
      <div class="yeti__lang card">
        <div class="yeti__lang__switch" data-lang={browserLang} onClick={this.handleAutoLangSwitch}>
          {switchText}
        </div>
      </div>
    )
  }
}
