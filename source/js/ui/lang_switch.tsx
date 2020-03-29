import { h, Component, Fragment } from 'preact'
import { Text } from 'preact-i18n'

import { AVAILABLE_LANGS, DEFAULT_LANG } from '../config'
import { findParentByClassname } from '../utility/dom'


export interface LangSwitchProps {
  lang: string
}


export interface LangSwitchState {
}


export default class LangSwitch extends Component<LangSwitchProps, LangSwitchState> {
  constructor(props: LangSwitchProps) {
    super(props)

    this.state = {} as LangSwitchState
  }

  handleLangSwitch(evt: any) {
    const target = findParentByClassname(evt.target, 'yeti__lang__switch')
    const lang = target.dataset.lang

    if (lang == DEFAULT_LANG) {
      window.location.href = '/'
    } else if (AVAILABLE_LANGS.includes(lang)) {
      window.location.href = `/${lang}/`
    }
  }

  render(props: LangSwitchProps, state: LangSwitchState) {
    if (AVAILABLE_LANGS.length < 2) {
      return ''
    }

    const otherLangs = AVAILABLE_LANGS.filter(lang => lang != props.lang)

    return (
      <div class="yeti__lang__chooser card">
        <div class="button__list">
          {otherLangs.map(lang => (
            <Fragment key={lang}>
              <button
                  class="button button--secondary yeti__lang__switch" data-lang={lang}
                  onClick={this.handleLangSwitch.bind(this)}>
                <Text id={`lang.languages.${lang}`} />
              </button>
            </Fragment>
          ))}
        </div>
      </div>
    )
  }
}
