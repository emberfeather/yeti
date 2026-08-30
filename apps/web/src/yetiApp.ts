import "@littoral/literally/structure/er-grid";
import "@littoral/literally/structure/er-spacer";
import "@littoral/literally/components/er-header";
import "@littoral/literally/localization/er-t";

import "./aiApp";

import { ERApp } from "@littoral/literally/structure/er-app";
import { PublicRoute } from "@littoral/literally/routing/route";
import { localizationContext } from "@littoral/literally/localization/context";
import {
  LocalizationManager,
  type Localization,
} from "@littoral/literally/localization/localization";
import { provide } from "@lit/context";
import { css, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

/**
 * Yeti app.
 */
@customElement("yeti-app")
export class YetiApp extends ERApp {
  @property({ type: String, attribute: "router-mode" })
  routerMode: "hash" | "path" = "path";

  private localizationManager = new LocalizationManager();

  @provide({ context: localizationContext })
  @state()
  private localization?: Localization;

  static styles = [
    ...ERApp.styles,
    css`
      .container {
        width: 100%;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();

    const mainRoute = new PublicRoute({
      template: html`<yeti-app-ai></yeti-app-ai>`,
    });

    // Root page & localized routes.
    this.routeTrie.add("/", mainRoute);
    this.routeTrie.add("/intl/{locale}", mainRoute);

    // 404.
    this.routeTrie.add(
      "/{missing:*}",
      new PublicRoute({
        template: html`
          <er-grid class="gap-row-large">
            <er-grid-item span="desktop:6; tablet:4">
              <er-h1><er-t key="not_found.header"></er-t></er-h1>
              <er-spacer size="large"></er-spacer>
              <div><er-t key="not_found.description"></er-t></div>
            </er-grid-item>
          </er-grid>
        `,
      }),
    );
  }

  private setMetaTag(
    selector: string,
    attrName: string,
    attrVal: string,
    content: string,
  ) {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  private updateMetadata() {
    if (!this.localization) return;

    const title =
      this.localization.t("meta.title") ||
      `${this.localization.t("app.title")} - Yeti`;
    if (title) {
      document.title = title;
      this.setMetaTag('meta[property="og:title"]', "property", "og:title", title);
      this.setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", title);
    }

    const description =
      this.localization.t("meta.description") ||
      this.localization.t("app.subtitle");
    if (description) {
      this.setMetaTag('meta[name="description"]', "name", "description", description);
      this.setMetaTag('meta[property="og:description"]', "property", "og:description", description);
      this.setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
    }
  }

  private async loadLocale(newLocale: string) {
    try {
      this.localization = await this.localizationManager.load(newLocale);
      document.documentElement.lang = newLocale;
      this.updateMetadata();
    } catch (e) {
      console.error("Failed to update locale:", e);
    }

    console.debug("Localization loaded", this.localization?.locale);
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has("routeTrieMatch")) {
      // Use the locale from the route trie match or default to the base locale.
      if (this.routeTrieMatch?.params?.locale) {
        this.loadLocale(this.routeTrieMatch.params.locale as string);
      } else {
        this.loadLocale("en");
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yeti-app": YetiApp;
  }
}
