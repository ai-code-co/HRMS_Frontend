import type { Component } from 'vue'

export interface TabConfig {
    id: 'personal' | 'bank' | 'password' | 'picture'
    label: string
    component: Component
}
