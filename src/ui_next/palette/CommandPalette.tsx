import React from "preact/compat";

import "./CommandPalette.css"
import {withFilteredPaletteItems} from "./withFilteredPaletteItems";

/**
 * Command palette context.
 *
 * Stores current value and give access to some functions
 */
export const CommandPaletteContext = React.createContext<{
    value?: string,
    onSelect?: (value: any) => any,
}>({});

/**
 * Command palette component props
 */
export type PaletteProps = React.PropsWithChildren<{
    onSelect?: (value: string) => any,
    onCancel?: () => any,
}>;

type HybridState = {
    search: string,
    localIndex: number,
}

export function CommandPalette(props: PaletteProps) {
    const [{search, localIndex}, setState] = React.useState<HybridState>({
        search: "",
        localIndex: -1,
    });
    const rootRef = React.createRef<HTMLDivElement>();
    const inputRef = React.createRef<HTMLInputElement>();

    const items = withFilteredPaletteItems(search, props.children);
    const value = items[localIndex] ? items[localIndex].props.value : "";

    /**
     * Set up input events
     */
    React.useEffect(() => {
        if(!inputRef.current) return;
        const input = inputRef.current;
        input.focus();

        input.oninput = () => {
            setState({localIndex: 0, search: input.value});
        };
        input.onkeyup = (e) => {
            e.stopPropagation();
        };
        input.onkeydown = (e) => {
            switch (e.key) {
                case "ArrowUp":
                    e.preventDefault();
                    if(localIndex > 0) {
                        setState({search, localIndex: localIndex - 1});
                    } else {
                        setState({search, localIndex: items.length - 1})
                    }
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    if(localIndex < items.length - 1) {
                        setState({search, localIndex: localIndex + 1});
                    } else {
                        setState({search, localIndex: 0})
                    }
                    break;
                case "Enter":
                    e.preventDefault();
                    const itemProps = items[localIndex].props;
                    if(itemProps.onSelect) itemProps.onSelect(itemProps.value);
                    if(props.onSelect) props.onSelect(itemProps.value);
                    break;
                case "Escape":
                    e.preventDefault();
                    if(props.onCancel) props.onCancel();
                    break;
            }
        }
    })

    return (
        <CommandPaletteContext.Provider value={{
            value,
            onSelect: props.onSelect
        }}>
            <div className="ui-command-palette" ref={rootRef} onClick={(e) => e.stopPropagation()}>
                <input type="text"
                       ref={inputRef}
                       placeholder="Filter..."
                       value={search} />
                <div className="ui-command-palette__items">
                    {items}
                </div>
            </div>
        </CommandPaletteContext.Provider>
    )
}
