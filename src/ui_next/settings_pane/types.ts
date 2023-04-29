export type SettingsRowProps<T> = {
    configKey: string,
    fallback: T,
    onChange?: (newValue: T) => any,
}
