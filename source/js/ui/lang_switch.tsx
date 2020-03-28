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

    return (
      <div class="yeti__lang__chooser card">
        <div class="yeti__lang__chooser__langs yeti__flex yeti__flex--row">
          {AVAILABLE_LANGS.map(lang => (
            <Fragment key={lang}>
              <div class={`yeti__lang__chooser__lang yeti__flex__item ${props.lang == lang ? 'yeti__lang__chooser__lang--selected' : ''}`}>
                <a href={`/${lang == DEFAULT_LANG ? '' : `${lang}/`}`}><Text id={`lang.languages.${lang}`} /></a>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    )
  }
}
