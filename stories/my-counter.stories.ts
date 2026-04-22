import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import '../src/my-counter.js'

const meta: Meta = {
  title: 'Components/MyCounter',
  tags: ['autodocs'],
  render: (args) => html`<my-counter label=${args.label}></my-counter>`,
  argTypes: {
    label: {
      control: 'text',
      description: 'Label shown next to the counter',
    },
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {
  args: {
    label: 'Counter',
  },
}

export const CustomLabel: Story = {
  args: {
    label: 'Score',
  },
}
