export function preventPropagation(e: any) {
    if(e.key !== "Shift")
        e.stopPropagation();
}
