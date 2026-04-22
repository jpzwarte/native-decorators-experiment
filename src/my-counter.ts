import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

// Custom decorator targeting a private method — logs every call including the private name.
// context.name will be "#step" (hash included) and context.private === true.
function logged(method: Function, context: ClassMethodDecoratorContext) {
  const name = String(context.name)
  return function (this: unknown, ...args: unknown[]) {
    console.log(`[logged] ${name}(${args.join(', ')})`)
    const result = method.apply(this, args)
    console.log(`[logged] ${name} → ${result}`)
    return result
  }
}

@customElement('my-counter')
export class MyCounter extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      font-family: sans-serif;
    }
    .container {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    button {
      width: 32px;
      height: 32px;
      font-size: 18px;
      cursor: pointer;
      border: 1px solid #999;
      border-radius: 4px;
      background: #f0f0f0;
    }
    button:hover {
      background: #e0e0e0;
    }
    .count {
      font-size: 24px;
      min-width: 40px;
      text-align: center;
    }
    .label {
      font-size: 14px;
      color: #666;
    }
  `

  @property({ type: String }) accessor label = 'Counter'
  @state() accessor count = 0

  // Modern decorator on a true JS private method (#-syntax).
  // tsdown must handle: TC39 decorators + private class methods together.
  @logged
  #step(delta: number): number {
    this.count += delta
    return this.count
  }

  render() {
    return html`
      <div class="container">
        <span class="label">${this.label}:</span>
        <button @click=${() => this.#step(-1)}>−</button>
        <span class="count">${this.count}</span>
        <button @click=${() => this.#step(1)}>+</button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-counter': MyCounter
  }
}
