import React, {Children, Component} from "preact/compat";
import {VNode} from "preact";
import {CommandPaletteItem, PaletteItemProps} from "./CommandPaletteItem";

type State = {
    items: VNode<PaletteItemProps>[],
    search: string,
    children: any,
}

function searchAll(children: any, output: VNode<PaletteItemProps>[]) {
    const allItems: VNode<any>[] = Children.toArray(children) as any;
    for(let item of allItems) {
        if(item.type == CommandPaletteItem) {
            output.push(item);
        } else if(item.props && item.props.children) {
            searchAll(item.props.children, output);
        }
    }
}

export function withFilteredPaletteItems(search: string, children: any) {
    const [data, setNewData] = React.useState<State>({
        search: null,
        items: [],
        children: children,
    });

    React.useEffect(() => {
        if(data == null || data.search != search || data.children != children) {
            const allItems: VNode<PaletteItemProps>[] = [];
            searchAll(children, allItems);

            const searchLower = search.toLowerCase();
            const items: VNode<PaletteItemProps>[] = [];
            for(let item of allItems) {
                if(item.props.children.toLowerCase().indexOf(searchLower) > -1)
                    items.push(item);
            }
            setNewData({items, search, children: children})
        }
    });

    return data.items;
}
